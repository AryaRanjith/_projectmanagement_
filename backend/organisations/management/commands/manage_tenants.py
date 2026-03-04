import os
from django.core.management.base import BaseCommand
from backend.tenancy.utils import provision_tenant
from organisations.models import Organisation

class Command(BaseCommand):
    help = 'Manages tenant databases (list, migrate, provision)'

    def add_arguments(self, parser):
        parser.add_argument('action', choices=['list', 'migrate-all', 'provision'], help='Action to perform')
        parser.add_argument('--org-id', type=int, help='Organisation ID for provision action')

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'list':
            orgs = Organisation.objects.all()
            self.stdout.write(self.style.SUCCESS(f"Found {orgs.count()} organisations:"))
            for org in orgs:
                db_path = f"tenants/tenant_{org.id}.sqlite3"
                exists = os.path.exists(db_path)
                status = "Exists" if exists else "Missing"
                self.stdout.write(f"- {org.name} (ID: {org.id}) - DB: {status}")

        elif action == 'migrate-all':
            orgs = Organisation.objects.all()
            for org in orgs:
                self.stdout.write(f"Migrating database for {org.name}...")
                provision_tenant(org.id)
            self.stdout.write(self.style.SUCCESS("All tenant databases migrated."))

        elif action == 'provision':
            org_id = options.get('org_id')
            if not org_id:
                self.stderr.write("Please provide --org-id")
                return
            
            try:
                org = Organisation.objects.get(id=org_id)
                self.stdout.write(f"Provisioning database for {org.name}...")
                provision_tenant(org.id)
                self.stdout.write(self.style.SUCCESS(f"Organisation {org.name} provisioned."))
            except Organisation.DoesNotExist:
                self.stderr.write(f"Organisation with ID {org_id} not found.")
