from rest_framework import serializers
from .models import Organisation


class OrganisationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Organisation
        fields = "__all__"


class AdminOrganisationSerializer(serializers.ModelSerializer):
    subscription_plan = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    subscription_id = serializers.SerializerMethodField()
    owner_email = serializers.SerializerMethodField()

    class Meta:
        model = Organisation
        fields = [
            'id', 'name', 'is_active', 'created_at',
            'subscription_plan', 'subscription_status', 'subscription_id', 'owner_email'
        ]

    def get_subscription_id(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.id
        return None

    def get_subscription_plan(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription.plan:
            return obj.subscription.plan.name
        return "Free"

    def get_subscription_status(self, obj):
        if hasattr(obj, 'subscription'):
            return "Active" if obj.subscription.is_active else "Inactive"
        return ""

    def get_owner_email(self, obj):
        # User model defines related_name='members' for organisation
        owner = obj.members.filter(role='OWNER').first() 
        return owner.email if owner else "Unknown"
