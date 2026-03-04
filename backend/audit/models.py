# audits/models.py

from django.db import models
from organisations.models import Organisation
from account.models import User


class PlatformAuditLog(models.Model):

    ACTION_CHOICES = [
        ('SUB_ACTIVATED', 'Subscription Activated'),
        ('SUB_CANCELLED', 'Subscription Cancelled'),
        ('ORG_CREATED', 'Organisation Created'),
        ('ORG_BLOCKED', 'Organisation Blocked'),
        ('ORG_ACTIVATED', 'Organisation Activated'),
        ('ORG_DELETED', 'Organisation Deleted'),
        ('TICKET_CLOSED', 'Ticket Closed'),
    ]

    action = models.CharField(max_length=255)

    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    target = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.organisation:
            org_name = self.organisation.name
        else:
            org_name = "System/All"
        return "{} - {}".format(self.action, org_name)
