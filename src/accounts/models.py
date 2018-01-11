from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from registration.signals import user_activated
from django.contrib.auth import login


# Create your models here.
@receiver(user_activated)
def login_on_activation(sender, user, request, **kwargs):
    """Logs in the user after activation"""
    user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)