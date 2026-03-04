import threading
from django.core.management import call_command

_thread_locals = threading.local()

def set_current_tenant(tenant_id):
    setattr(_thread_locals, 'tenant_id', tenant_id)

def get_current_tenant():
    return getattr(_thread_locals, 'tenant_id', None)

def clear_current_tenant():
    if hasattr(_thread_locals, 'tenant_id'):
        delattr(_thread_locals, 'tenant_id')

def provision_tenant(tenant_id):
    """
    Run migrations for a specific tenant database.
    """
    db_name = f'tenant_{tenant_id}'
    from django.conf import settings
    _ = settings.DATABASES[db_name] 
    call_command('migrate', database=db_name, interactive=False)
