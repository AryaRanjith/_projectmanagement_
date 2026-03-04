# audits/serializers.py

from rest_framework import serializers
from .models import PlatformAuditLog


class AuditLogSerializer(serializers.ModelSerializer):

    organisation_name = serializers.SerializerMethodField()

    def get_organisation_name(self, obj):
        return obj.organisation.name if obj.organisation else "System"

    class Meta:
        model = PlatformAuditLog
        fields = ['action', 'organisation_name', 'created_at']
