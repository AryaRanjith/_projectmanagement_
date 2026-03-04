from django.urls import path
from .views import *

urlpatterns = [

    path('create/', CreateTicketView.as_view()),
    path('my/', MyTicketsView.as_view()),

    # Admin
    path('admin/all/', AllTicketsAdminView.as_view()),
    path('admin/reply/<int:ticket_id>/', ReplyTicketView.as_view()),
    path('admin/close/<int:ticket_id>/', CloseTicketView.as_view()),

]
