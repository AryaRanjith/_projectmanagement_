from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import OrganisationSerializer
from account.permissions import IsOwner, IsSuperAdmin
from .models import Organisation


class CreateOrganisationView(APIView):

    permission_classes = [IsOwner]

    def post(self, request):

        serializer = OrganisationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organisation = serializer.save()

        request.user.organisation = organisation
        request.user.save()

        return Response(serializer.data, status=201)
from audit.utils import log_admin_action


class SuspendOrganisationView(APIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, org_id):
        try:
            org = Organisation.objects.get(id=org_id)
            org.is_active = False
            org.save()
            
            log_admin_action(
                admin=request.user,
                action="ORG_BLOCKED",
                target=f"Org ID {org.id}",
                organisation=org
            )
            return Response({"msg": "Organisation suspended"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class ActivateOrganisationView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, org_id):
        try:
            org = Organisation.objects.get(id=org_id)
            org.is_active = True
            org.save()
            
            log_admin_action(
                admin=request.user,
                action="ORG_ACTIVATED",
                target=f"Org ID {org.id}",
                organisation=org
            )
            return Response({"msg": "Organisation activated"})
        except Organisation.DoesNotExist:
            return Response({"error": "Organisation not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class AdminOrganisationListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        # Prefetch related subscription and users (members) to optimize
        queryset = Organisation.objects.prefetch_related('members').select_related('subscription', 'subscription__plan').all().order_by('-created_at')
        
        # Search
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(email__icontains=search_query) |
                Q(members__email__icontains=search_query, members__role='OWNER')
            ).distinct()

        from .serializers import AdminOrganisationSerializer
        serializer = AdminOrganisationSerializer(queryset, many=True)
        return Response(serializer.data)


class CreateOrganisationAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        # We need to create Organisation AND User (Owner)
        # Data expected: { name, email, owner_email, owner_password, plan_type? }
        
        from account.models import User
        from django.db import transaction
        
        try:
            with transaction.atomic():
                # 1. Create Org
                org_serializer = OrganisationSerializer(data=request.data)
                org_serializer.is_valid(raise_exception=True)
                org = org_serializer.save()
                
                # 2. Create Owner User
                owner_email = request.data.get('owner_email')
                owner_password = request.data.get('owner_password')
                
                if not owner_email or not owner_password:
                    raise Exception("Owner email and password required")
                    
                if User.objects.filter(email=owner_email).exists():
                     raise Exception("User with this email already exists")

                user = User.objects.create_user(
                    username=owner_email,
                    email=owner_email,
                    password=owner_password,
                    role='OWNER',
                    organisation=org
                )
                
                # 3. Log
                log_admin_action(
                    admin=request.user,
                    action="Created Organisation",
                    target=f"Org {org.name} (ID {org.id})"
                )
                
                return Response(org_serializer.data, status=201)
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class EditOrganisationAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def put(self, request, org_id):
        try:
            org = Organisation.objects.get(id=org_id)
            serializer = OrganisationSerializer(org, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            log_admin_action(
                admin=request.user,
                action="Edited Organisation",
                target=f"Org {org.name} (ID {org.id})"
            )
            
            return Response(serializer.data)
        except Organisation.DoesNotExist:
            return Response({"error": "Organisation not found"}, status=404)


class DeleteOrganisationAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, org_id):
        try:
            from django.db import connection
            
            # First, check if organisation exists
            try:
                org = Organisation.objects.get(id=org_id)
                org_name = org.name
            except Organisation.DoesNotExist:
                return Response({"error": "Organisation not found"}, status=404)
            
            # Use raw SQL to bypass Django's cascade logic entirely
            with connection.cursor() as cursor:
                cursor.execute("PRAGMA foreign_keys = OFF")
                
                # Explicitly find and delete the owner user first
                cursor.execute("SELECT id FROM account_user WHERE organisation_id = %s AND role = 'OWNER'", [org_id])
                owner_row = cursor.fetchone()
                if owner_row:
                    owner_id = owner_row[0]
                    cursor.execute("DELETE FROM account_user WHERE id = %s", [owner_id])
                    # Also delete their notifications
                    cursor.execute("DELETE FROM account_notification WHERE user_id = %s", [owner_id])

                # Delete all related records using raw SQL
                tables_to_clean = [
                    ('account_user', 'organisation_id'),
                    ('billing_subscription', 'organisation_id'),
                    ('billing_payment', 'subscription_id'),
                    ('billing_invoice', 'subscription_id'),
                    ('account_employeeinvitation', 'organisation_id'),
                    ('account_notification', 'user_id'),
                ]
                
                for table, column in tables_to_clean:
                    try:
                        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=%s", [table])
                        if cursor.fetchone():
                            if column == 'organisation_id':
                                query = "DELETE FROM {} WHERE {} = %s".format(table, column)
                                cursor.execute(query, [org_id])
                            elif column == 'subscription_id':
                                query = """
                                    DELETE FROM {} 
                                    WHERE {} IN (
                                        SELECT id FROM billing_subscription WHERE organisation_id = %s
                                    )
                                """.format(table, column)
                                cursor.execute(query, [org_id])
                            elif column == 'user_id':
                                query = """
                                    DELETE FROM {} 
                                    WHERE {} IN (
                                        SELECT id FROM account_user WHERE organisation_id = %s
                                    )
                                """.format(table, column)
                                cursor.execute(query, [org_id])
                    except Exception:
                        pass  # Silently skip if table doesn't exist or cleanup fails
                
                # Try to clean projects-related tables if they exist
                project_tables = [
                    'projects_timeentry',
                    'projects_task',
                    'projects_milestone',
                    'projects_document',
                    'projects_project'
                ]
                
                for table in project_tables:
                    try:
                        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=%s", [table])
                        if cursor.fetchone():
                            query = "DELETE FROM {} WHERE organisation_id = %s".format(table)
                            cursor.execute(query, [org_id])
                    except Exception:
                        pass  # Silently skip if table doesn't exist
                
                # Delete the organisation using raw SQL to bypass Django's cascade
                cursor.execute("DELETE FROM organisations_organisation WHERE id = %s", [org_id])
                
                cursor.execute("PRAGMA foreign_keys = ON")
            
            # Log after deletion (without org reference since it's deleted)
            try:
                log_admin_action(
                    admin=request.user,
                    action="ORG_DELETED",
                    target="Org {} (ID {})".format(org_name, org_id),
                    organisation=None
                )
            except Exception as log_error:
                # Don't fail the deletion if logging fails
                print("Warning: Failed to log deletion:", str(log_error))
            
            return Response({"msg": "Organisation deleted successfully"}, status=200)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            error_message = str(e)
            return Response({"error": error_message}, status=400)



# ===============================
# OWNER-SPECIFIC VIEWS
# ===============================

from account.models import User, EmployeeInvitation
from account.serializers import EmployeeSerializer, EmployeeInvitationSerializer
from projects.models import Project, Task
from billing.models import Subscription
from django.utils import timezone
from datetime import timedelta
import secrets


class OwnerDashboardStatsView(APIView):
    """Dashboard statistics for organisation owner"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        # Get counts
        employees = User.objects.filter(organisation=org, role='EMPLOYEE')
        projects = Project.objects.filter(organisation=org)
        tasks = Task.objects.filter(project__organisation=org)

        # Task stats
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='DONE').count()
        in_progress_tasks = tasks.filter(status='IN_PROGRESS').count()
        
        overdue_tasks_list = tasks.filter(due_date__lt=timezone.now().date(), status__in=['TODO', 'IN_PROGRESS'])
        overdue_tasks_count = overdue_tasks_list.count()

        # Task type stats
        task_type_stats = {
            'TASK': tasks.filter(task_type='TASK').count(),
            'FEATURE': tasks.filter(task_type='FEATURE').count(),
            'IMPROVEMENT': tasks.filter(task_type='IMPROVEMENT').count(),
        }

        # Priority stats
        priority_stats = {
            'LOW': tasks.filter(priority='LOW').count(),
            'MEDIUM': tasks.filter(priority='MEDIUM').count(),
            'HIGH': tasks.filter(priority='HIGH').count(),
            'URGENT': tasks.filter(priority='URGENT').count(),
        }

        # Status stats
        status_stats = {
            'TODO': tasks.filter(status='TODO').count(),
            'IN_PROGRESS': tasks.filter(status='IN_PROGRESS').count(),
            'REVIEW': tasks.filter(status='REVIEW').count(),
            'DONE': tasks.filter(status='DONE').count(),
        }

        # Detailed overdue tasks
        overdue_details = [
            {
                'id': t.id,
                'title': t.title,
                'project_name': t.project.name,
                'due_date': t.due_date,
                'priority': t.priority
            }
            for t in overdue_tasks_list[:5]
        ]

        # Employee stats
        active_employees = employees.filter(is_active_employee=True).count()
        total_employees = employees.count()

        # Project stats & Overview
        total_projects = projects.count()
        active_projects = projects.filter(status='ACTIVE').count()
        
        project_overview = [
            {
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'status': p.status,
                'progress': p.progress_percentage,
                'task_count': p.task_count,
                'end_date': p.end_date,
                'members_count': p.tasks.values('assignee').distinct().count()
            }
            for p in projects.order_by('-created_at')[:4]
        ]

        # Calculate overall task completion percentage
        task_completion = 0
        if total_tasks > 0:
            task_completion = int((completed_tasks / total_tasks) * 100)

        # Recent activity
        recent_tasks = tasks.order_by('-updated_at')[:5]
        recent_tasks_data = [
            {
                'id': t.id,
                'title': t.title,
                'status': t.status,
                'assignee': t.assignee.username if t.assignee else None,
                'updated_at': t.updated_at,
                'task_type': t.task_type
            }
            for t in recent_tasks
        ]

        # My Tasks (assigned to owner)
        my_tasks = tasks.filter(assignee=request.user).order_by('-updated_at')[:5]
        my_tasks_data = [
            {
                'id': t.id,
                'title': t.title,
                'status': t.status,
                'priority': t.priority,
                'task_type': t.task_type
            }
            for t in my_tasks
        ]

        return Response({
            'total_projects': total_projects,
            'active_projects': active_projects,
            'total_employees': total_employees,
            'active_employees': active_employees,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'overdue_tasks': overdue_tasks_count,
            'task_completion_percentage': task_completion,
            'recent_tasks': recent_tasks_data,
            'task_type_stats': task_type_stats,
            'priority_stats': priority_stats,
            'status_stats': status_stats,
            'overdue_details': overdue_details,
            'project_overview': project_overview,
            'my_tasks': my_tasks_data
        })


class OwnerEmployeeListView(APIView):
    """List all employees in the organisation"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        employees = User.objects.filter(organisation=org, role='EMPLOYEE').order_by('-date_joined')
        serializer = EmployeeSerializer(employees, many=True)
        
        # Also get pending invitations
        invitations = EmployeeInvitation.objects.filter(
            organisation=org, 
            is_used=False,
            expires_at__gt=timezone.now()
        )
        invitation_serializer = EmployeeInvitationSerializer(invitations, many=True)

        return Response({
            'employees': serializer.data,
            'pending_invitations': invitation_serializer.data
        })


class OwnerEmployeeInviteView(APIView):
    """Invite a new employee via email"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request):
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        email = request.data.get('email', '').strip().lower()
        employee_role = request.data.get('employee_role', 'ASSIGNEE')

        if not email:
            return Response({"error": "Email is required"}, status=400)

        # Check if user already exists in this org
        if User.objects.filter(email=email, organisation=org).exists():
            return Response({"error": "User with this email already exists in your organisation"}, status=400)

        # Check for existing pending invitation
        if EmployeeInvitation.objects.filter(email=email, organisation=org, is_used=False).exists():
            return Response({"error": "An invitation is already pending for this email"}, status=400)

        # Create invitation
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(days=7)

        invitation = EmployeeInvitation.objects.create(
            email=email,
            organisation=org,
            employee_role=employee_role,
            token=token,
            invited_by=request.user,
            expires_at=expires_at
        )

        # Import email utility
        from .utils import send_invitation_email
        
        # Send email with invitation link
        invitation_link = f"http://localhost:4200/account/accept-invite/{token}"
        email_sent = send_invitation_email(invitation, invitation_link)

        return Response({
            "msg": "Invitation created successfully",
            "invitation_link": invitation_link,
            "email_sent": email_sent,
            "expires_at": expires_at
        }, status=201)


class CancelInvitationView(APIView):
    """Cancel a pending invitation"""
    permission_classes = [IsAuthenticated, IsOwner]

    def delete(self, request, invitation_id):
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        try:
            invitation = EmployeeInvitation.objects.get(id=invitation_id, organisation=org, is_used=False)
            invitation.delete()
            return Response({"msg": "Invitation cancelled successfully"})
        except EmployeeInvitation.DoesNotExist:
            return Response({"error": "Invitation not found or already used"}, status=404)


class OwnerEmployeeToggleView(APIView):
    """Enable/disable an employee"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, employee_id):
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        try:
            employee = User.objects.get(id=employee_id, organisation=org, role='EMPLOYEE')
            employee.is_active_employee = not employee.is_active_employee
            employee.save()

            status_text = "enabled" if employee.is_active_employee else "disabled"
            return Response({
                "msg": f"Employee {status_text} successfully",
                "is_active_employee": employee.is_active_employee
            })
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)


class OwnerSubscriptionStatusView(APIView):
    """Get current subscription status for the organisation"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        try:
            subscription = Subscription.objects.select_related('plan').get(organisation=org)
            days_remaining = (subscription.end_date - timezone.now()).days if subscription.end_date else 0

            return Response({
                'has_subscription': True,
                'plan_name': subscription.plan.name if subscription.plan else 'Trial',
                'plan_type': subscription.plan.plan_type if subscription.plan else None,
                'start_date': subscription.start_date,
                'end_date': subscription.end_date,
                'is_active': subscription.is_active,
                'auto_renew': subscription.auto_renew,
                'days_remaining': max(0, days_remaining),
                'max_users': subscription.plan.max_users if subscription.plan else 5,
                'org_name': org.name
            })
        except Subscription.DoesNotExist:
            return Response({
                'has_subscription': False,
                'plan_name': None,
                'is_active': False,
                'days_remaining': 0,
                'org_name': org.name
            })

class EmployeeDashboardStatsView(APIView):
    """Dashboard statistics for an employee"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'EMPLOYEE':
            return Response({"error": "Only employees can access this view"}, status=403)
            
        org = request.user.organisation
        if not org:
            return Response({"error": "No organisation found"}, status=400)

        # Get tasks assigned to this employee
        my_tasks = Task.objects.filter(assignee=request.user).order_by('-updated_at')
        
        # Simple stats
        total_tasks = my_tasks.count()
        completed_tasks = my_tasks.filter(status='DONE').count()
        in_progress_tasks = my_tasks.filter(status='IN_PROGRESS').count()
        
        # Recent tasks data
        tasks_data = [
            {
                'id': t.id,
                'title': t.title,
                'description': t.description,
                'status': t.status,
                'priority': t.priority,
                'due_date': t.due_date,
                'task_type': t.task_type,
                'project_name': t.project.name if t.project else None,
                'progress': t.progress,
                'updated_at': t.updated_at
            }
            for t in my_tasks
        ]

        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'tasks': tasks_data
        })
