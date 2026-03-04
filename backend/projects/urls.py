from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    OwnerProjectViewSet,
    OwnerTaskViewSet,
    OwnerMilestoneViewSet,
    OwnerTimeEntryViewSet,
    OwnerDocumentViewSet,
    EmployeeTaskViewSet
)

# Default router (legacy)
router = DefaultRouter()
router.register(r'projects', ProjectViewSet)

# Owner router
owner_router = DefaultRouter()
owner_router.register(r'projects', OwnerProjectViewSet, basename='owner-projects')
owner_router.register(r'tasks', OwnerTaskViewSet, basename='owner-tasks')
owner_router.register(r'milestones', OwnerMilestoneViewSet, basename='owner-milestones')
owner_router.register(r'time-entries', OwnerTimeEntryViewSet, basename='owner-time-entries')
owner_router.register(r'documents', OwnerDocumentViewSet, basename='owner-documents')

# Employee router
employee_router = DefaultRouter()
employee_router.register(r'tasks', EmployeeTaskViewSet, basename='employee-tasks')

urlpatterns = [
    path('', include(router.urls)),
    path('owner/', include(owner_router.urls)),
    path('employee/', include(employee_router.urls)),
]

