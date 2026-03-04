from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import TransactionTestCase
from account.models import User
from organisations.models import Organisation
from backend.tenancy.utils import provision_tenant 
import shutil
from django.conf import settings
from pathlib import Path

class DashboardTests(TransactionTestCase):
    databases = {'default', 'tenant_1'}
    
    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        
        # Create Organisation
        self.org = Organisation.objects.create(
            id=1, # Force ID to match databases declaration
            name="Test Org",
            email="testorg@example.com"
        )
        
        # Create Owner
        self.user = User.objects.create_user(
            username="owner@example.com",
            email="owner@example.com",
            password="password123",
            role='OWNER',
            organisation=self.org
        )
        
        # Provision Tenant DB
        # This will create 'tenants/tenant_{id}.sqlite3'
        try:
           provision_tenant(self.org.id)
        except Exception as e:
           print(f"Provisioning failed in test setup: {e}")

        self.client.force_authenticate(user=self.user)
        self.dashboard_url = "/api/organisations/owner/dashboard/"

    def tearDown(self):
        # Cleanup tenant DB file if it exists
        db_name = f"tenant_{self.org.id}.sqlite3"
        db_path = settings.BASE_DIR / 'tenants' / db_name
        if db_path.exists():
            try:
                # Close connections to this DB specifically?
                from django.db import connections
                if f'tenant_{self.org.id}' in connections:
                    connections[f'tenant_{self.org.id}'].close()
                # db_path.unlink() # Deleting might be locked on Windows
                pass
            except Exception as e:
                print(f"Error cleaning up DB: {e}")

    def test_owner_dashboard_load(self):
        """
        Ensure owner dashboard loads without 500 error.
        This verifies that Project/Task queries are routed to the 
        tenant DB and that the tenant DB is correctly provisioned.
        """
        response = self.client.get(self.dashboard_url)
        if response.status_code != 200:
            print(f"Dashboard failed. Status: {response.status_code}")
            print(f"Response data: {response.data}")
            
        self.assertEqual(response.status_code, status.HTTP_200_OK)
