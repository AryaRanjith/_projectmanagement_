# audits/views.py

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PlatformAuditLog
from .serializers import AuditLogSerializer


from account.permissions import IsSuperAdmin

class PlatformAuditView(APIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):

        logs = PlatformAuditLog.objects.select_related('organisation').order_by('-created_at')

        serializer = AuditLogSerializer(logs, many=True)

        return Response(serializer.data)
