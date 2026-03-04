from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import User, EmployeeInvitation

# ===== JWT Serializer for Login =====

class MyTokenSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        login_id = attrs.get('username')
        password = attrs.get('password')
        
        if login_id and password:
            from django.contrib.auth import authenticate
            from django.db.models import Q
            
            # Find all potential users matching this email OR username
            # Given user's mess in DB, we check both to be absolutely sure
            potential_users = User.objects.filter(Q(email__iexact=login_id) | Q(username__iexact=login_id))
            
            for user in potential_users:
                # Try to authenticate with each potential match
                authenticated_user = authenticate(username=user.username, password=password)
                if authenticated_user:
                    attrs['username'] = authenticated_user.username
                    return super().validate(attrs)
                    
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Force SUPERADMIN role for superusers to ensure admin login works
        if user.is_superuser:
            token['role'] = 'SUPERADMIN'
        else:
            token['role'] = user.role if user.role else 'EMPLOYEE'
            
        try:
            token['organisation_id'] = user.organisation.id if user.organisation else None
            token['org_name'] = user.organisation.name if user.organisation else None
            token['org_email'] = user.organisation.email if user.organisation else None
        except Organisation.DoesNotExist:
            token['organisation_id'] = None
            token['org_name'] = None
            token['org_email'] = None
            
        return token


from organisations.models import Organisation
from django.db import transaction


class CompanySignupSerializer(serializers.Serializer):

    org_name = serializers.CharField()
    org_email = serializers.EmailField()

    owner_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_org_email(self, value):
        value = value.strip().lower()
        if Organisation.objects.filter(email=value).exists():
            raise serializers.ValidationError("An organisation with this email already exists.")
        return value

    def validate_owner_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        # Normalize data before creation
        owner_email = validated_data['owner_email'].strip().lower()
        org_email = validated_data['org_email'].strip().lower()

        # Create organisation
        org = Organisation.objects.create(
            name=validated_data['org_name'],
            email=org_email
        )

        # Create owner
        user = User.objects.create_user(
            username=owner_email,
            email=owner_email,
            password=validated_data['password'],
            role='OWNER',
            organisation=org
        )

        return user


# ===== Employee Serializers =====

class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for employees in an organisation"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'employee_role', 'is_active_employee', 'invited_at',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['date_joined', 'last_login', 'invited_at']


class EmployeeInvitationSerializer(serializers.ModelSerializer):
    """Serializer for employee invitations"""
    invited_by_name = serializers.CharField(source='invited_by.username', read_only=True)
    
    class Meta:
        model = EmployeeInvitation
        fields = [
            'id', 'email', 'employee_role', 'token', 'invited_by',
            'invited_by_name', 'created_at', 'expires_at', 'is_used'
        ]
        read_only_fields = ['token', 'invited_by', 'created_at', 'expires_at', 'is_used']

