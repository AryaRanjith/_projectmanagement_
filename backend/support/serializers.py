from rest_framework import serializers
from .models import Ticket, TicketReply


class TicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['organisation', 'created_by', 'status']


class TicketReplySerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketReply
        fields = '__all__'
        read_only_fields = ['replied_by', 'ticket']
