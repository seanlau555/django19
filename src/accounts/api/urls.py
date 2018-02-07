from django.conf.urls import url
from django.contrib import admin

from .views import (
	UserCreateAPIView,
	UserLoginAPIView,
	UserUpdateAPIView,
	ProfileUpdateAPIView,
	)

urlpatterns = [
    url(r'^register/$', UserCreateAPIView.as_view(), name='register'),
    url(r'^login/$', UserLoginAPIView.as_view(), name='login'),
    url(r'^(?P<id>[\w-]+)/user/$', UserUpdateAPIView.as_view(), name='user'),
    url(r'^(?P<id>[\w-]+)/profile/$', ProfileUpdateAPIView.as_view(), name='profile'),
]