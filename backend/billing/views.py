from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

import stripe

from .models import (
    Plan,
    Subscription,
    Payment,
    Invoice
)

from .serializers import PlanSerializer
from organisations.models import Organisation
from account.permissions import IsSuperAdmin


# ===============================
# STRIPE CONFIG
# ===============================
stripe.api_key = settings.STRIPE_SECRET_KEY


# ===============================
# HELPERS
# ===============================
def activate_subscription_plan(org, plan, payment_intent="mock_intent"):
    """Core logic to activate a plan, save payment, invoice and notify"""
    with transaction.atomic():
        start = timezone.now()
        end = start + timedelta(days=plan.duration_months * 30)

        subscription, created = Subscription.objects.update_or_create(
            organisation=org,
            defaults={
                "plan": plan,
                "start_date": start,
                "end_date": end,
                "is_active": True,
                "auto_renew": True,
                "is_trial": False,
                "status": "ACTIVE"
            }
        )

        Payment.objects.create(
            subscription=subscription,
            amount=plan.price,
            provider="stripe",
            payment_id=payment_intent,
            status="SUCCESS"
        )

        invoice_no = f"INV-{org.id}-{int(timezone.now().timestamp())}"
        Invoice.objects.create(
            subscription=subscription,
            invoice_no=invoice_no,
            amount=plan.price
        )

        from account.models import Notification, User
        owner = User.objects.filter(organisation=org, role='OWNER').first()
        if owner:
            Notification.objects.create(
                user=owner,
                message=f"Success! Your {plan.name} subscription is now active."
            )

        # Notify Superadmins
        superadmins = User.objects.filter(is_superuser=True)
        for admin in superadmins:
            Notification.objects.create(
                user=admin,
                message=f"New Payment: {org.name} subscribed to {plan.name} (₹{plan.price})"
            )
    return subscription

# ===============================
# LIST PLANS
# ===============================
class PlanListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        plans = Plan.objects.filter(is_active=True)

        serializer = PlanSerializer(plans, many=True)

        return Response(serializer.data)


# ===============================
# CREATE CHECKOUT
# ===============================
class CreateCheckoutSession(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user
        org = user.organisation

        if not org:
            return Response(
                {"error": "No organisation found"},
                status=400
            )

        plan_id = request.data.get('plan_id')

        if not plan_id:
            return Response(
                {"error": "plan_id required"},
                status=400
            )

        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response(
                {"error": "Invalid plan"},
                status=404
            )

        try:

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                metadata={
                    "org_id": org.id,
                    "plan_id": plan.id
                },
                line_items=[{
                    "price_data": {
                        "currency": "inr",
                        "product_data": {
                            "name": plan.name
                        },
                        "unit_amount": int(plan.price * 100)
                    },
                    "quantity": 1
                }],
                success_url="http://localhost:4200/owner/payment-success",
                cancel_url="http://localhost:4200/owner/payment-cancel"
            )

            return Response({
                "checkout_url": session.url
            })

        except Exception as e:
            if settings.MOCK_PAYMENT:
                # If in Mock mode, return a special simulation URL or the success URL directly
                print(f"Checkout creation failed: {e}. Falling back to MOCK mode.")
                return Response({
                    "checkout_url": f"http://localhost:4200/owner/payment-success?mock_plan={plan.id}",
                    "is_mock": True
                })

            return Response({
                "error": str(e)
            }, status=500)


# ===============================
# STRIPE WEBHOOK
# ===============================
class StripeWebhookView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):

        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:

            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )

        except stripe.error.SignatureVerificationError:
            return Response({"error": "Invalid signature"}, status=400)

        except Exception:
            return Response({"error": "Webhook error"}, status=400)


        # ===============================
        # PAYMENT SUCCESS
        # ===============================
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            org_id = session["metadata"]["org_id"]
            plan_id = session["metadata"]["plan_id"]

            try:
                org = Organisation.objects.get(id=org_id)
                plan = Plan.objects.get(id=plan_id)
                activate_subscription_plan(org, plan, session.get("payment_intent", "wh_intent"))
            except Exception as e:
                print(f"Webhook processing error: {e}")
                return Response(status=200) # Still return 200 to Stripe

        return Response(status=200)

class MockPaymentSimulateView(APIView):
    """
    Endpoint to simulate a successful payment without real Stripe interaction.
    Used for local development when MOCK_PAYMENT is on.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not settings.MOCK_PAYMENT:
            return Response({"error": "Mock mode not enabled"}, status=403)

        plan_id = request.data.get('plan_id')
        org = request.user.organisation

        if not org or not plan_id:
            return Response({"error": "Missing data"}, status=400)

        try:
            plan = Plan.objects.get(id=plan_id)
            activate_subscription_plan(org, plan, "mock_success_intent")
            return Response({"msg": "Mock payment simulated successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ===============================
# FREE TRIAL
# ===============================
class StartTrialView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        org = request.user.organisation

        if not org:
            return Response({"error": "No organisation"}, status=400)


        if Subscription.objects.filter(organisation=org).exists():
            return Response({"error": "Subscription already exists"}, status=400)


        start = timezone.now()
        end = start + timedelta(days=14)


        Subscription.objects.create(
            organisation=org,
            plan=None,
            start_date=start,
            end_date=end,
            is_active=True,
            auto_renew=False,
            is_trial=True,
            status='TRIAL'
        )


        return Response({"msg": "Trial started"})


# ===============================
# ADMIN TOGGLE SUBSCRIPTION
# ===============================
class ToggleSubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, sub_id):

        try:
            sub = Subscription.objects.get(id=sub_id)
            sub.is_active = not sub.is_active
            sub.save()
            
            # Log action
            from audit.utils import log_admin_action
            action = "Deactivated Subscription" if not sub.is_active else "Activated Subscription"
            log_admin_action(
                admin=request.user,
                action=action,
                target=f"Sub ID {sub.id} (Org {sub.organisation.id})"
            )
            
            return Response({"msg": f"Subscription {action}", "is_active": sub.is_active})
            
        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=404)


# ===============================
# ADMIN PLAN MANAGEMENT
# ===============================
class AdminPlanListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        
        plans = Plan.objects.all().order_by('-is_active', 'price')
        serializer = PlanSerializer(plans, many=True)
        return Response(serializer.data)

class AdminPlanCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):

        serializer = PlanSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class AdminPlanUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def put(self, request, pk):

        try:
            plan = Plan.objects.get(pk=pk)
        except Plan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=404)

        serializer = PlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminPlanDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, pk):

        try:
            plan = Plan.objects.get(pk=pk)
            # Soft delete preferable, but hard delete for now if no dependencies
            # If used by subscriptions, set is_active=False instead
            if Subscription.objects.filter(plan=plan).exists():
                plan.is_active = False # Soft delete
                plan.save()
                return Response({'msg': 'Plan deactivated (in use)'})
            else:
                plan.delete()
                return Response({'msg': 'Plan deleted'})
        except Plan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=404)

