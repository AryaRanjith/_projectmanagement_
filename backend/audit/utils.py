from .models import PlatformAuditLog


def log_admin_action(admin, action, target=None, organisation=None):

    PlatformAuditLog.objects.create(
        admin=admin,
        action=action,
        target=target,
        organisation=organisation
    )
