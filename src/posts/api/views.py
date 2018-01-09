from django.utils.text import slugify
from django.db.models import Q

from rest_framework.filters import (
	SearchFilter,
	OrderingFilter,
)
from rest_framework.generics import (
	CreateAPIView,
	ListAPIView, 
	RetrieveAPIView,
	RetrieveUpdateAPIView,
	UpdateAPIView,
	DestroyAPIView,
)
from rest_framework.permissions import (
	AllowAny,
	IsAuthenticated,
	IsAdminUser,
	IsAuthenticatedOrReadOnly,
)

from posts.models import Post, PostImage
from .pagination import PostLimitOffsetPagination, PostPageNumberPagination
from .permissions import IsOwnerOrReadOnly
from .serializers import PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer, PostImageCreateSerializer
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

def create_slug(instance, new_slug=None):
	slug = slugify(instance.title)
	if new_slug is not None:
		slug = new_slug
	qs = Post.objects.filter(slug=slug).exclude(id=instance.id).order_by("-id")
	exists = qs.exists()
	if exists:
		new_slug = "%s-%s" %(slug, qs.first().id)
		return create_slug(instance, new_slug=new_slug)
	return slug

class PostCreateAPIView(CreateAPIView):
	queryset = Post.objects.all()
	serializer_class = PostCreateUpdateSerializer
	permission_classes = [IsAuthenticated]
	authentication_classes = [SessionAuthentication]
	# permission_classes = [AllowAny]

	def perform_create(self, serializer):
		# user = User.objects.get(id=1)
		serializer.save(user=self.request.user)

class PostImageCreateAPIView(CreateAPIView):
	queryset = PostImage.objects.all()
	serializer_class = PostImageCreateSerializer
	permission_classes = [IsAuthenticated]
	authentication_classes = [SessionAuthentication]

class PostDetailAPIView(RetrieveAPIView):
	queryset = Post.objects.all()
	permission_classes = [AllowAny]
	serializer_class = PostDetailSerializer
	lookup_field = 'id'

class PostUpdateAPIView(RetrieveUpdateAPIView):
	queryset = Post.objects.all()
	serializer_class = PostCreateUpdateSerializer
	lookup_field = 'id'
	permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
	authentication_classes = [SessionAuthentication]

	def perform_update(self, serializer):
		serializer.save(user=self.request.user)
		serializer.save(slug=create_slug(self.get_object()))

class PostDeleteAPIView(DestroyAPIView):
	queryset = Post.objects.all()
	serializer_class = PostDetailSerializer
	lookup_field = 'id'
	permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
	authentication_classes = [SessionAuthentication]

class PostListAPIView(ListAPIView):
	serializer_class = PostListSerializer
	filter_backends = [SearchFilter, OrderingFilter]
	search_fields = ['title', 'content', 'user__first_name']
	pagination_class = PostPageNumberPagination #PageNumberPagination
	permission_classes = [AllowAny]

	def get_queryset(self, *arg, **kwarg):
		# queryset_list = super(PostListAPIView, self).get_queryset(*args, **kwargs)
		queryset_list = Post.objects.all()
		query = self.request.GET.get("q")
		if query:
			queryset_list = queryset_list.filter(
				Q(title__icontains=query) |
				Q(content__icontains=query) |
				Q(user__first_name__icontains=query) |
				Q(user__last_name__icontains=query)
				).distinct()
		return queryset_list