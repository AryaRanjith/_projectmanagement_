from django.db import models

# Create your models here.
from django.db import models
from organisations.models import Organisation

# ========== Plans ==========
class Plan(models.Model):

    PLAN_TYPE = (
        ('PRO', 'Pro'),
        ('ENT', 'Enterprise'),
    )

    name = models.CharField(max_length=100)

    plan_type = models.CharField(
        max_length=10,
        choices=PLAN_TYPE
    )
    duration_months = models.IntegerField()  
    # 6 / 12
    max_users = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.name} ({self.duration_months}M / {self.max_users} Users)"


# ========== Subscription ==========
class Subscription(models.Model):

    organisation = models.OneToOneField(
        Organisation,
        on_delete=models.CASCADE
    )

    plan = models.ForeignKey(
        Plan,
        on_delete=models.SET_NULL,
        null=True
    )

    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()

    is_active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=True)
    is_trial = models.BooleanField(default=False)
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRES_SOON', 'Expires Soon'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
        ('TRIAL', 'Trial'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return self.organisation.name


# ========== Payments ==========
class Payment(models.Model):

    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=8, decimal_places=2)

    provider = models.CharField(max_length=50)  
    # stripe / razorpay / paypal

    payment_id = models.CharField(max_length=200)

    status = models.CharField(max_length=50)  
    # success / failed / pending

    created_at = models.DateTimeField(auto_now_add=True)


# ========== Invoices ==========
class Invoice(models.Model):

    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE
    )

    invoice_no = models.CharField(max_length=50)

    amount = models.DecimalField(max_digits=8, decimal_places=2)

    pdf_file = models.FileField(upload_to='invoices/')

    created_at = models.DateTimeField(auto_now_add=True)
