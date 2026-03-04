from django.urls import path
from .views import (
    MyTokenView, 
    CompanySignupView,
    VerifyInviteView,
    AcceptInviteView,
    ProfileUpdateView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView
)

urlpatterns = [
    path('signup/', CompanySignupView.as_view(), name='signup'),
    path('login/', MyTokenView.as_view(), name='token_obtain_pair'),
    path('verify-invite/<str:token>/', VerifyInviteView.as_view(), name='verify_invite'),
    path('accept-invite/<str:token>/', AcceptInviteView.as_view(), name='accept_invite'),
    path('profile/', ProfileUpdateView.as_view(), name='profile_update'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/read/<int:pk>/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
]
