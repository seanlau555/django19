from django.conf.urls import url
from django.contrib import admin

from .views import ProfileView, SettingView

urlpatterns = [
    url(r'^(?P<username>[\w-]+)/$', ProfileView, name='profile'),
    url(r'^(?P<username>[\w-]+)/settings/$', SettingView, name='settings'),
]