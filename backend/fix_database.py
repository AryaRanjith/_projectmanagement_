import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- fixing database integrity ---")

# 1. Clean Audit Logs
print("Cleaning audit logs...")
cursor.execute("""
    DELETE FROM audit_platformauditlog 
    WHERE organisation_id NOT IN (SELECT id FROM organisations_organisation)
    AND organisation_id IS NOT NULL
""")
print(f"Deleted {cursor.rowcount} orphan audit logs.")

# 2. Clean Users
print("Cleaning users...")
cursor.execute("""
    DELETE FROM account_user 
    WHERE (organisation_id NOT IN (SELECT id FROM organisations_organisation) AND organisation_id IS NOT NULL)
    OR (organisation_id IS NULL AND role != 'SUPERADMIN')
""")
print(f"Deleted {cursor.rowcount} orphan users (Invalid Org or NULL Org).")

# 3. Clean Notifications (user requested)
print("Cleaning notifications...")
cursor.execute("DELETE FROM account_notification")
print(f"Deleted {cursor.rowcount} notifications.")

# 4. Check for missing tables
tables = ['projects_timeentry', 'projects_task', 'projects_project']
for t in tables:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,))
    if not cursor.fetchone():
        print(f"Warning: Table {t} is missing.")
        # We can't easily recreate it here without schema.
        # But cleaning FKs might allow 'migrate' to run.

conn.commit()
conn.close()
print("Done.")
