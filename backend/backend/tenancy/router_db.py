from .utils import get_current_tenant

class TenantRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label in ['account', 'organisations', 'billing', 'admin', 'auth', 'contenttypes', 'sessions', 'messages', 'audit', 'support', 'analytics']:
            return 'default'
        
        tenant_id = get_current_tenant()
        if tenant_id:
            return f'tenant_{tenant_id}'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in ['account', 'organisations', 'billing', 'admin', 'auth', 'contenttypes', 'sessions', 'messages', 'audit', 'support', 'analytics']:
            return 'default'
        
        tenant_id = get_current_tenant()
        if tenant_id:
            return f'tenant_{tenant_id}'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in ['account', 'organisations', 'billing', 'admin', 'auth', 'contenttypes', 'sessions', 'messages', 'audit', 'support', 'analytics']:
            return db == 'default'
        
        if db.startswith('tenant_'):
            return True
        
        return False
