from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Ticket
from .serializers import TicketSerializer
from account.permissions import IsOwner, IsSuperAdmin


class CreateTicketView(APIView):

    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request):

        serializer = TicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        org = request.user.organisation
        if not org:
            return Response({"error": "You must belong to an organisation to create tickets"}, status=400)

        serializer.save(
            organisation=org,
            created_by=request.user
        )

        return Response(serializer.data, status=201)
class MyTicketsView(APIView):

    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        org = request.user.organisation
        if not org:
            return Response([])

        tickets = Ticket.objects.filter(
            organisation=org
        )

        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
class AllTicketsAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        tickets = Ticket.objects.all().order_by('-created_at')
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)


from .models import TicketReply
from .serializers import TicketReplySerializer


class ReplyTicketView(APIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, ticket_id):

        ticket = Ticket.objects.get(id=ticket_id)

        serializer = TicketReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(
            ticket=ticket,
            replied_by=request.user
        )

        ticket.status = 'IN_PROGRESS'
        ticket.save()

        return Response(serializer.data)
class CloseTicketView(APIView):

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, ticket_id):

        ticket = Ticket.objects.get(id=ticket_id)
        ticket.status = 'CLOSED'
        ticket.save()

        return Response({'msg': 'Ticket closed'})
