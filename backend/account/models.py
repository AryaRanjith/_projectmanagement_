from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    ROLE_CHOICES = [
        ('SUPERADMIN', 'Super Admin'),
        ('OWNER', 'Organisation Owner'),
        ('EMPLOYEE', 'Employee'),
    ]

    EMPLOYEE_ROLE_CHOICES = [
        ('ASSIGNEE', 'Assignee'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='EMPLOYEE'
    )

    employee_role = models.CharField(
        max_length=20,
        choices=EMPLOYEE_ROLE_CHOICES,
        null=True,
        blank=True,
        help_text="Sub-role for employees within an organisation"
    )

    organisation = models.ForeignKey(
        'organisations.Organisation',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='members'
    )

    is_active_employee = models.BooleanField(
        default=True,
        help_text="Whether this employee is active within their organisation"
    )

    invited_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this user was invited to the organisation"
    )

    def __str__(self):
        return self.username


class EmployeeInvitation(models.Model):
    """Pending employee invitations"""
    email = models.EmailField()
    organisation = models.ForeignKey(
        'organisations.Organisation',
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    employee_role = models.CharField(
        max_length=20,
        choices=User.EMPLOYEE_ROLE_CHOICES,
        default='ASSIGNEE'
    )
    token = models.CharField(max_length=64, unique=True)
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invitations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Invitation to {self.email} for {self.organisation.name}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}"
