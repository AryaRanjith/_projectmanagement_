from django.urls import path
from .views import (
    SuspendOrganisationView, 
    ActivateOrganisationView, 
    AdminOrganisationListView,
    CreateOrganisationAdminView,
    EditOrganisationAdminView,
    DeleteOrganisationAdminView,
    # Owner views
    OwnerDashboardStatsView,
    OwnerEmployeeListView,
    OwnerEmployeeInviteView,
    OwnerEmployeeToggleView,
    OwnerSubscriptionStatusView,
    CancelInvitationView,
    EmployeeDashboardStatsView,
)

urlpatterns = [
    # Admin routes
    path('admin/all/', AdminOrganisationListView.as_view()),
    path('admin/create/', CreateOrganisationAdminView.as_view()),
    path('admin/edit/<int:org_id>/', EditOrganisationAdminView.as_view()),
    path('admin/delete/<int:org_id>/', DeleteOrganisationAdminView.as_view()),
    path('admin/suspend/<int:org_id>/', SuspendOrganisationView.as_view()),
    path('admin/activate/<int:org_id>/', ActivateOrganisationView.as_view()),
    
    # Owner routes
    path('owner/dashboard/', OwnerDashboardStatsView.as_view()),
    path('owner/employees/', OwnerEmployeeListView.as_view()),
    path('owner/employees/invite/', OwnerEmployeeInviteView.as_view()),
    path('owner/employees/toggle/<int:employee_id>/', OwnerEmployeeToggleView.as_view()),
    path('owner/employees/invitations/<int:invitation_id>/', CancelInvitationView.as_view()),
    path('owner/subscription/', OwnerSubscriptionStatusView.as_view()),

    # Employee routes
    path('employee/dashboard/', EmployeeDashboardStatsView.as_view()),
]

