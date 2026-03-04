from django.shortcuts import render

# Create your views here.
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenSerializer


class MyTokenView(TokenObtainPairView):
    serializer_class = MyTokenSerializer

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CompanySignupSerializer

class CompanySignupView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):

        print(f"Signup attempt with data: {request.data}")
        serializer = CompanySignupSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Signup validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Provision the new tenant database
        try:
            from backend.tenancy.utils import provision_tenant
            provision_tenant(user.organisation.id)
        except Exception as e:
            print(f"Error provisioning tenant database: {e}")

        refresh = RefreshToken.for_user(user)

        return Response({
            "msg": "Account created",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "organisation_id": user.organisation.id
        }, status=201)

from .models import EmployeeInvitation, User
from django.utils import timezone

class VerifyInviteView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        try:
            invitation = EmployeeInvitation.objects.get(token=token, is_used=False, expires_at__gt=timezone.now())
            return Response({
                "email": invitation.email,
                "organisation_name": invitation.organisation.name,
                "role": invitation.employee_role
            })
        except EmployeeInvitation.DoesNotExist:
            return Response({"error": "Invalid or expired invitation"}, status=404)

class AcceptInviteView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, token):
        try:
            invitation = EmployeeInvitation.objects.get(token=token, is_used=False, expires_at__gt=timezone.now())
            password = request.data.get('password')

            if not password:
                return Response({"error": "Password is required"}, status=400)

            # Create the user
            user = User.objects.create_user(
                username=invitation.email,
                email=invitation.email,
                password=password,
                role='EMPLOYEE',
                organisation=invitation.organisation,
                employee_role=invitation.employee_role
            )

            # Mark invitation as used
            invitation.is_used = True
            invitation.save()

            # Generate tokens for auto-login
            refresh = RefreshToken.for_user(user)

            return Response({
                "msg": "Account created successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
                "organisation_id": user.organisation.id
            }, status=201)
        except EmployeeInvitation.DoesNotExist:
            return Response({"error": "Invalid or expired invitation"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({"error": "Email already in use"}, status=400)
            user.email = email
            user.username = email # Keep username in sync if preferred, or just leave it
            
        if username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({"error": "Username already in use"}, status=400)
            user.username = username

        if password:
            user.set_password(password)

        user.save()
        return Response({"msg": "Profile updated successfully"})
from .models import Notification

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        data = [{
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifs]
        return Response(data)

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"msg": "Marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"msg": "All marked as read"})
