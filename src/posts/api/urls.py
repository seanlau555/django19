from django.conf.urls import url
from django.contrib import admin

from .views import (
	PostCreateAPIView,
	PostDeleteAPIView,
	PostDetailAPIView,
	PostListAPIView,
	PostUpdateAPIView,
	PostImageCreateAPIView,
	)

urlpatterns = [
    url(r'^$', PostListAPIView.as_view(), name='list'),
    url(r'^create/$', PostCreateAPIView.as_view(), name='create'),
    url(r'^(?P<id>[\w-]+)/edit/$', PostUpdateAPIView.as_view(), name='update'),
    url(r'^(?P<id>[\w-]+)/$', PostDetailAPIView.as_view(), name='detail'),
    url(r'^(?P<id>[\w-]+)/delete/$', PostDeleteAPIView.as_view(), name='delete'),
    url(r'^image/create/$', PostImageCreateAPIView.as_view(), name='createimage'),
]