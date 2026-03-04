from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Project, Task, Milestone, TimeEntry, Document
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer,
    TaskSerializer, MilestoneSerializer, TimeEntrySerializer, DocumentSerializer
)
from account.permissions import IsOwner, ProjectPermission


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


# ===============================
# OWNER PROJECT VIEWSET
# ===============================

class OwnerProjectViewSet(viewsets.ModelViewSet):
    """
    Project CRUD for organisation owners and leads.
    Access controlled by ProjectPermission.
    """
    permission_classes = [IsAuthenticated, ProjectPermission]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        org = self.request.user.organisation
        if org:
            queryset = Project.objects.filter(organisation=org).order_by('-created_at')
            
            search_query = self.request.query_params.get('search', '').strip()
            if search_query:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(name__icontains=search_query) | 
                    Q(description__icontains=search_query)
                )
            
            return queryset
        return Project.objects.none()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(
            organisation=self.request.user.organisation,
            owner=self.request.user
        )


# ===============================
# OWNER TASK VIEWSET
# ===============================

class OwnerTaskViewSet(viewsets.ModelViewSet):
    """Task CRUD for organisation owners"""
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = TaskSerializer

    def get_queryset(self):
        org = self.request.user.organisation
        if org:
            queryset = Task.objects.filter(project__organisation=org).order_by('-created_at')
            
            # Filter by project if specified
            project_id = self.request.query_params.get('project')
            if project_id:
                queryset = queryset.filter(project_id=project_id)
            
            # Filter by status if specified
            task_status = self.request.query_params.get('status')
            if task_status:
                queryset = queryset.filter(status=task_status)
            
            # Filter by assignee if specified
            assignee_id = self.request.query_params.get('assignee')
            if assignee_id:
                queryset = queryset.filter(assignee_id=assignee_id)
            
            # Search
            search_query = self.request.query_params.get('search', '').strip()
            if search_query:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(title__icontains=search_query) |
                    Q(description__icontains=search_query)
                )
            
            return queryset
        return Task.objects.none()

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update task progress percentage"""
        task = self.get_object()
        progress = request.data.get('progress', 0)
        
        if not (0 <= progress <= 100):
            return Response({"error": "Progress must be between 0 and 100"}, status=400)
        
        task.progress = progress
        if progress == 100:
            task.status = 'DONE'
        task.save()
        
        return Response({
            "msg": "Progress updated",
            "progress": task.progress,
            "status": task.status
        })

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign task to an employee"""
        task = self.get_object()
        assignee_id = request.data.get('assignee_id')
        
        if assignee_id:
            from account.models import User
            try:
                assignee = User.objects.get(
                    id=assignee_id,
                    organisation=request.user.organisation
                )
                task.assignee = assignee
                task.save()
                return Response({"msg": f"Task assigned to {assignee.username}"})
            except User.DoesNotExist:
                return Response({"error": "Employee not found"}, status=404)
        else:
            task.assignee = None
            task.save()
            return Response({"msg": "Task unassigned"})


# ===============================
# OWNER MILESTONE VIEWSET
# ===============================

class OwnerMilestoneViewSet(viewsets.ModelViewSet):
    """Milestone CRUD for organisation owners"""
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = MilestoneSerializer

    def get_queryset(self):
        org = self.request.user.organisation
        if org:
            queryset = Milestone.objects.filter(project__organisation=org)
            
            project_id = self.request.query_params.get('project')
            if project_id:
                queryset = queryset.filter(project_id=project_id)
            
            return queryset
        return Milestone.objects.none()

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark milestone as completed"""
        milestone = self.get_object()
        milestone.is_completed = True
        milestone.completed_at = timezone.now()
        milestone.save()
        return Response({"msg": "Milestone completed"})


# ===============================
# OWNER TIME ENTRY VIEWSET
# ===============================

class OwnerTimeEntryViewSet(viewsets.ModelViewSet):
    """Time entry CRUD for organisation owners"""
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = TimeEntrySerializer

    def get_queryset(self):
        org = self.request.user.organisation
        if org:
            queryset = TimeEntry.objects.filter(task__project__organisation=org)
            
            task_id = self.request.query_params.get('task')
            if task_id:
                queryset = queryset.filter(task_id=task_id)
            
            user_id = self.request.query_params.get('user')
            if user_id:
                queryset = queryset.filter(user_id=user_id)
            
            return queryset
        return TimeEntry.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ===============================
# OWNER DOCUMENT VIEWSET
# ===============================

class OwnerDocumentViewSet(viewsets.ModelViewSet):
    """Document CRUD for organisation owners"""
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = DocumentSerializer

    def get_queryset(self):
        org = self.request.user.organisation
        if org:
            queryset = Document.objects.filter(project__organisation=org)
            
            project_id = self.request.query_params.get('project')
            if project_id:
                queryset = queryset.filter(project_id=project_id)
            
            return queryset
        return Document.objects.none()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# ===============================
# EMPLOYEE TASK VIEWSET
# ===============================

class EmployeeTaskViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset for employees to see and update their assigned tasks"""
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(assignee=self.request.user).order_by('-updated_at')

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({"error": "Invalid status"}, status=400)
            
        task.status = new_status
        if new_status == 'DONE':
            task.progress = 100
        elif new_status == 'TODO':
            task.progress = 0
            
        task.save()
        return Response({
            "msg": "Status updated",
            "status": task.status,
            "progress": task.progress
        })

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        task = self.get_object()
        new_progress = request.data.get('progress')
        
        try:
            progress_val = int(new_progress)
            if not 0 <= progress_val <= 100:
                raise ValueError
        except (TypeError, ValueError):
            return Response({"error": "Progress must be integer 0-100"}, status=400)
            
        task.progress = progress_val
        if progress_val == 100:
            task.status = 'DONE'
        elif progress_val > 0 and task.status == 'TODO':
            task.status = 'IN_PROGRESS'
            
        task.save()
        return Response({
            "msg": "Progress updated",
            "progress": task.progress,
            "status": task.status
        })
