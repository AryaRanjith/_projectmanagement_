from django.urls import path
from .views import PlatformAuditView

urlpatterns = [
    path('platform/', PlatformAuditView.as_view()),
]
