from django.core.management.base import BaseCommand
from billing.models import Plan

class Command(BaseCommand):
    help = 'Seeds initial subscription plans'

    def handle(self, *args, **kwargs):
        plans = [
            {
                'name': 'Pro Plan',
                'plan_type': 'PRO',
                'duration_months': 1,
                'max_users': 10,
                'price': 2999.00,
                'is_active': True
            },
            {
                'name': 'Enterprise Plan',
                'plan_type': 'ENT',
                'duration_months': 12,
                'max_users': 100,
                'price': 24999.00,
                'is_active': True
            }
        ]

        for plan_data in plans:
            # Check if plan with this type exists
            existing_plans = Plan.objects.filter(plan_type=plan_data['plan_type'])
            
            if existing_plans.exists():
                # Update the first one
                plan = existing_plans.first()
                for key, value in plan_data.items():
                    setattr(plan, key, value)
                plan.save()
                self.stdout.write(self.style.WARNING(f'Updated existing plan: {plan.name}'))
                
                # Optionally delete duplicates if any
                if existing_plans.count() > 1:
                    for dup in existing_plans[1:]:
                        dup.delete()
                    self.stdout.write(self.style.WARNING(f'Removed duplicate plans for type: {plan_data["plan_type"]}'))
            else:
                Plan.objects.create(**plan_data)
                self.stdout.write(self.style.SUCCESS(f'Created plan: {plan_data["name"]}'))
