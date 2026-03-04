from .utils import set_current_tenant, clear_current_tenant
from django.utils.deprecation import MiddlewareMixin
try:
    from rest_framework_simplejwt.authentication import JWTAuthentication
except ImportError:
    JWTAuthentication = None

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        set_current_tenant(None)
        
        if request.user.is_authenticated:
            if hasattr(request.user, 'organisation') and request.user.organisation:
                set_current_tenant(request.user.organisation.id)
                return

        if JWTAuthentication:
            auth = JWTAuthentication()
            try:
                result = auth.authenticate(request)
                if result:
                    user, _ = result
                    if hasattr(user, 'organisation') and user.organisation:
                        set_current_tenant(user.organisation.id)
            except Exception:
                pass

    def process_response(self, request, response):
        clear_current_tenant()
        return response
