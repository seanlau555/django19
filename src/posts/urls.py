from django.conf.urls import url
from django.contrib import admin

from .views import (
	post_home,
	post_list,
	post_detail,
	post_update,
	post_create,
	post_delete,
	)

urlpatterns = [
    # url(r'^$', post_home, name='home'),
    url(r'^create/$', post_create, name='create'),
    url(r'^list/$', post_list, name='list'),
    url(r'^(?P<slug>[\w-]+)/edit/$', post_update, name='update'),
    url(r'^(?P<slug>[\w-]+)/$', post_detail, name='detail'),
    url(r'^(?P<slug>[\w-]+)/delete/$', post_delete),
]
