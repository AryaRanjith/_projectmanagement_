from django.core.management.base import BaseCommand
from organisations.models import Organisation
from backend.tenancy.utils import provision_tenant

class Command(BaseCommand):
    help = 'Repairs unmigrated tenant databases'

    def handle(self, *args, **options):
        orgs = Organisation.objects.all()
        self.stdout.write(f"checking {orgs.count()} organisations...")
        
        for org in orgs:
            try:
                self.stdout.write(f"Provisioning tenant for {org.name} (ID: {org.id})...")
                provision_tenant(org.id)
                self.stdout.write(self.style.SUCCESS(f"Successfully repaired tenant: {org.name}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to repair tenant {org.name}: {e}"))
