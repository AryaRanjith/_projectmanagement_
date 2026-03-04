from .models import Subscription
from django.utils import timezone


def can_add_user(org):

    sub = Subscription.objects.filter(
        organisation=org,
        is_active=True,
        end_date__gt=timezone.now()
    ).first()

    if not sub:
        return False

    current_users = org.members.count()

    return current_users < sub.plan.max_users
