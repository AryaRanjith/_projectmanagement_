
import os
import django
import sys
import traceback

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from organisations.models import Organisation
from account.models import User
from audit.utils import log_admin_action

def debug_deletion(org_id):
    print(f"--- Debugging deletion for Org ID: {org_id} ---")
    try:
        org = Organisation.objects.get(id=org_id)
        org_name = org.name
        print(f"Found org: {org_name}")
    except Organisation.DoesNotExist:
        print("Org not found")
        return

    try:
        # Simulate log_admin_action
        print("Testing log_admin_action PRE-deletion...")
        log_admin_action(
            admin=User.objects.filter(role='SUPERADMIN').first(),
            action="DEBUG_TEST",
            target="Org {} (ID {})".format(org_name, org_id),
            organisation=org
        )
        print("log_admin_action PRE-deletion success.")
        
        # Simulate RAW SQL deletion
        print("Starting Raw SQL Deletion...")
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA foreign_keys = OFF")
            
            tables_to_clean = [
                ('account_user', 'organisation_id'),
                # ... other tables
            ]
            
            table = 'account_user'
            column = 'organisation_id'
            
            # TEST FORMATTING with %s
            query = "DELETE FROM {} WHERE {} = %s".format(table, column)
            print(f"Query: {query}")
            cursor.execute(query, [org_id])
            print("Query executed.")
            
            cursor.execute("PRAGMA foreign_keys = ON")

        # Simulate log_admin_action POST-deletion (None org)
        print("Testing log_admin_action POST-deletion...")
        log_admin_action(
            admin=User.objects.filter(role='SUPERADMIN').first(),
            action="ORG_DELETED",
            target="Org {} (ID {})".format(org_name, org_id),
            organisation=None
        )
        print("log_admin_action POST-deletion success.")
        
    except Exception as e:
        print("\n!!! EXCEPTION CAUGHT !!!")
        traceback.print_exc()

if __name__ == '__main__':
    # Create a dummy org to test
    try:
        org = Organisation.objects.create(name="Debug Deletion Org")
        print(f"Created dummy org: {org.id}")
        debug_deletion(org.id)
    except Exception as e:
        print(f"Setup failed: {e}")
