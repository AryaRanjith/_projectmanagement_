from django.utils import timezone
from rest_framework.permissions import BasePermission
from .models import Subscription


class HasActiveSubscription(BasePermission):

    def has_permission(self, request, view):

        org = request.user.organisation

        sub = Subscription.objects.filter(
            organisation=org,
            is_active=True,
            end_date__gt=timezone.now()
        ).first()

        return bool(sub)
