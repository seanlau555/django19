from django.db.models import Q
from django.contrib.auth import get_user_model

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from rest_framework.filters import (
        SearchFilter,
        OrderingFilter,
    )

from rest_framework.mixins import DestroyModelMixin, UpdateModelMixin
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView, 
    UpdateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView
    )
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
    )
from rest_framework.authentication import SessionAuthentication

from accounts.api.serializers import UserUpdateSerializer, ProfileUpdateSerializer

from accounts.api.permissions import IsUserOrReadOnly, IsOwnerOrReadOnly
from posts.api.pagination import PostLimitOffsetPagination, PostPageNumberPagination
from profiles.models import Profile

User = get_user_model()

from .serializers import (
	UserCreateSerializer,
	UserLoginSerializer,
	)

class UserCreateAPIView(CreateAPIView):
	serializer_class = UserCreateSerializer
	queryset = User.objects.all()
	permission_classes = [AllowAny]

class UserLoginAPIView(APIView):
	permission_classes = [AllowAny]
	serializer_class = UserLoginSerializer

	def post(self, request, *args, **kwargs):
		data = request.data
		serializer = UserLoginSerializer(data=data)
		if serializer.is_valid(raise_exception=True):
			new_data = serializer.data
			return Response(new_data, status=HTTP_200_OK)
		return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class UserUpdateAPIView(RetrieveUpdateAPIView):
	queryset = User.objects.all()
	serializer_class = UserUpdateSerializer
	lookup_field = 'id'
	permission_classes = [IsAuthenticatedOrReadOnly, IsUserOrReadOnly]
	authentication_classes = [SessionAuthentication]

class ProfileUpdateAPIView(RetrieveUpdateAPIView):
	queryset = Profile.objects.all()
	serializer_class = ProfileUpdateSerializer
	lookup_field = 'id'
	permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
	authentication_classes = [SessionAuthentication]