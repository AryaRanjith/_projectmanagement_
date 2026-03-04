from django.shortcuts import render

# Create your views here.
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from account.permissions import IsSuperAdmin
from organisations.models import Organisation
from billing.models import Subscription, Payment
from account.models import User


class PlatformAnalyticsView(APIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):

        now = timezone.now()
        last_month = now - timedelta(days=30)


        # =====================
        # BASIC COUNTS
        # =====================

        total_orgs = Organisation.objects.count()

        total_users = User.objects.count()

        active_subs = Subscription.objects.filter(
            is_active=True,
            end_date__gte=now
        ).count()

        # trails check can be added if models have it, but for now we remove it


        # =====================
        # REVENUE
        # =====================

        total_revenue = Payment.objects.filter(
            status="SUCCESS"
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0


        monthly_revenue = Payment.objects.filter(
            status="SUCCESS",
            created_at__gte=last_month
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0


        # =====================
        # CHURN (Expired Subs)
        # =====================

        from django.db.models import Q
        churn_count = Subscription.objects.filter(
            Q(is_active=False) | Q(end_date__lt=now)
        ).distinct().count()


        # =====================
        # NEW COMPANIES
        # =====================

        new_orgs = Organisation.objects.filter(
            created_at__gte=last_month
        ).count()

        recent_orgs = Organisation.objects.all().order_by('-created_at')[:5]
        recent_orgs_data = []
        for org in recent_orgs:
            recent_orgs_data.append({
                'name': org.name,
                'created_at': org.created_at
            })


        # =====================
        # RESPONSE
        # =====================

        data = {

            "total_organisations": total_orgs,

            "total_users": User.objects.exclude(is_superuser=True).count(),

            "active_subscriptions": active_subs,

            "total_revenue": total_revenue,

            "monthly_revenue": monthly_revenue,

            "churned_companies": churn_count,

            "new_organisations_last_30_days": new_orgs,
            "recent_organisations": recent_orgs_data,
        }

        # Revenue Analytics (Last 6 Months)
        import calendar
        revenue_analytics = {
            'labels': [],
            'data': []
        }
        signup_analytics = {
            'labels': [],
            'data': []
        }
        
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=i*30)
            month_name = month_date.strftime("%B")
            revenue_analytics['labels'].append(month_name)
            signup_analytics['labels'].append(month_name)
            
            # Start/End of that 30-day window (approximation)
            start_date = month_date - timedelta(days=15) # Centered? No, just use simple logic
            # Better: Group by actual month.
            # But for simplicity, just query objects created in that month.
            year = month_date.year
            month = month_date.month
            
            rev = Payment.objects.filter(
                created_at__year=year, 
                created_at__month=month, 
                status='SUCCESS'
            ).aggregate(total=Sum('amount'))['total'] or 0
            revenue_analytics['data'].append(float(rev))
            
            signups = Organisation.objects.filter(
                created_at__year=year,
                created_at__month=month
            ).count()
            signup_analytics['data'].append(signups)

        data['revenue_analytics'] = revenue_analytics
        data['signup_analytics'] = signup_analytics

        # Recent Tickets
        from support.models import Ticket
        
        recent_tickets = Ticket.objects.select_related('organisation').all().order_by('-created_at')[:5]
        tickets_data = [
            {
                'id': t.id,
                'subject': t.subject,
                'status': t.status,
                'priority': t.priority,
                'created_at': t.created_at,
                'org_name': t.organisation.name if t.organisation else 'Unknown'
            }
            for t in recent_tickets
        ]
        
        data['recent_tickets'] = tickets_data
        
        return Response(data)
