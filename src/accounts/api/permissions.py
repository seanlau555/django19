from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsUserOrReadOnly(BasePermission):
	message = 'You must login as with the account you want to alter'
	# my_safe_method = ['GET', 'PUT']

	# def has_permissions(self, request, view):
	# 	if request.method in self.my_safe_method:
	# 		return True
	# 	return False

	def has_object_permission(self, request, view, obj):
		if request.method in SAFE_METHODS:
			return True
		return obj == request.user

class IsOwnerOrReadOnly(BasePermission):
	message = 'You must login as with the account you want to alter'
	# my_safe_method = ['GET', 'PUT']

	# def has_permissions(self, request, view):
	# 	if request.method in self.my_safe_method:
	# 		return True
	# 	return False

	def has_object_permission(self, request, view, obj):
		if request.method in SAFE_METHODS:
			return True
		return obj.user == request.user