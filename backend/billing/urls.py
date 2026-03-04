from django.urls import path
from .views import (
    PlanListView, 
    CreateCheckoutSession, 
    ToggleSubscriptionStatusView,
    AdminPlanListView,
    AdminPlanCreateView,
    AdminPlanUpdateView,
    AdminPlanDeleteView,
    MockPaymentSimulateView,
    StripeWebhookView
)

urlpatterns = [
    path('plans/', PlanListView.as_view(), name='plan-list'),
    path('checkout/', CreateCheckoutSession.as_view(), name='create-checkout-session'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('simulate-success/', MockPaymentSimulateView.as_view(), name='mock-payment-simulate'),
    path('admin/toggle-subscription/<int:sub_id>/', ToggleSubscriptionStatusView.as_view()),
    
    # Admin Plan Management
    path('admin/plans/all/', AdminPlanListView.as_view()),
    path('admin/plans/create/', AdminPlanCreateView.as_view()),
    path('admin/plans/edit/<int:pk>/', AdminPlanUpdateView.as_view()),
    path('admin/plans/delete/<int:pk>/', AdminPlanDeleteView.as_view()),

]
