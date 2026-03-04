from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'SUPERADMIN' or request.user.is_superuser


class IsOwner(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == 'OWNER'


class IsEmployee(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == 'EMPLOYEE'


class ProjectPermission(BasePermission):
    """
    Custom permission for Project access:
    - OWNER: Full access to all organisation projects
    - PROJECT_LEAD: Full access to projects they own
    - TEAM_LEAD: Read access to all organisation projects (can edit tasks)
    - EMPLOYEE: Read access to projects they strictly belong to (if logic exists) or no access
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated or not request.user.organisation:
            return False
            
        # List/Create checks
        if view.action == 'create':
            # Only Owner and Project Lead can create projects
            if request.user.role == 'OWNER':
                return True
            if request.user.role == 'EMPLOYEE' and request.user.employee_role == 'PROJECT_LEAD':
                return True
            return False
            
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Must be in same organisation
        if obj.organisation != user.organisation:
            return False
            
        # Organisation Owner has full access
        if user.role == 'OWNER':
            return True
            
        if user.role == 'EMPLOYEE':
            # Project Lead
            if user.employee_role == 'PROJECT_LEAD':
                # Can edit if they are the owner
                if obj.owner == user:
                    return True
                # Can view others? Maybe read-only?
                # For now, let's say restricted to own projects for edit, view all?
                # User asked "who all can view projects".
                # Let's assume Project Lead sees ALL, edits OWN.
                if request.method in ['GET', 'HEAD', 'OPTIONS']:
                    return True
                return False
            
            # Team Lead - Read Only on Project (Tasks handled separately)
            if user.employee_role == 'TEAM_LEAD':
                if request.method in ['GET', 'HEAD', 'OPTIONS']:
                    return True
                return False
                
            # Viewer / Other
            if user.employee_role == 'VIEWER':
                 if request.method in ['GET', 'HEAD', 'OPTIONS']:
                    return True
        
        return False
