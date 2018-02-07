"""django19 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.generic.base import TemplateView
from django.urls import reverse_lazy

from rest_framework_jwt.views import obtain_jwt_token

from posts import views
from accounts.views import MyRegistrationView
from registration.views import RegistrationView
# from accounts.views import (login_view, register_view, logout_view)

from files.views import FilePolicyAPI, AvatarFilePolicyAPI, FileUploadCompleteHandler

urlpatterns = [
    url(r'^$', views.post_home, name='home'),
    url(r'^posts/', include("posts.urls", namespace='posts')),
    url(r'^accounts/password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/'r'(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',auth_views.PasswordResetConfirmView.as_view(success_url=reverse_lazy("auth_password_reset_complete")),name='auth_password_reset_confirm'),
    url(r'^accounts/password/reset/$', auth_views.PasswordResetView.as_view(success_url='done'), name='password_reset'),
    url(r'^accounts/password/change/$', auth_views.PasswordChangeView.as_view(success_url='done'), name='password_change'),
    url(r'^accounts/register/$', MyRegistrationView.as_view(), name="registration_register"),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^accounts/', include('accounts.urls', namespace="accounts")),

    url(r'^admin/', admin.site.urls),
    url(r'^comments/', include("comments.urls", namespace='comments')),
    # url(r'^login/', login_view, name='login'),
    # url(r'^register/', register_view, name='register'),
    # url(r'^logout/', logout_view, name='logout'),
    url(r'^api/accounts/', include("accounts.api.urls", namespace='accounts-api')),
    url(r'^api/posts/', include("posts.api.urls", namespace='posts-api')),
    url(r'^api/comments/', include("comments.api.urls", namespace='comments-api')),
    url(r'^api/users/', include("accounts.api.urls", namespace='users-api')),
    url(r'^api/token/auth/', obtain_jwt_token),
    url(r'^api/files/avatar/$', AvatarFilePolicyAPI.as_view(), name='avatar-upload-policy'),
    url(r'^api/files/policy/$', FilePolicyAPI.as_view(), name='upload-policy'),
    url(r'^api/files/complete/$', FileUploadCompleteHandler.as_view(), name='upload-complete'),
]

if settings.DEBUG:
	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)