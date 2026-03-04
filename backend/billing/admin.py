from django.contrib import admin

# Register your models here.
from .models import Plan, Subscription, Payment, Invoice

admin.site.register(Plan)
admin.site.register(Subscription)
admin.site.register(Payment)
admin.site.register(Invoice)
