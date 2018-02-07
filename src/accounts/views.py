from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import (
	authenticate,
	get_user_model,
	login,
	logout,
	)
from django.shortcuts import render, get_object_or_404, redirect

# from .forms import UserLoginForm
# from .forms import UserRegisterForm
from .forms import UserForm
from profiles.models import Profile

from registration.backends.default.views import RegistrationView

# Create your views here.

ACCOUNT_AUTHENTICATED_REGISTRATION_REDIRECTS = getattr(settings, 'ACCOUNT_AUTHENTICATED_REGISTRATION_REDIRECTS', True)

class MyRegistrationView(RegistrationView):
	form_class = UserForm

	def dispatch(self, request, *args, **kwargs):
		"""
        Check that user signup is allowed and if user is logged in before even bothering to
        dispatch or do other processing.
        """
		if ACCOUNT_AUTHENTICATED_REGISTRATION_REDIRECTS:
			if self.request.user.is_authenticated:
				if settings.LOGIN_REDIRECT_URL is not None:
					return redirect(settings.LOGIN_REDIRECT_URL)
				else:
					raise Exception((
						'You must set a URL with LOGIN_REDIRECT_URL in '
						'settings.py or set '
						'ACCOUNT_AUTHENTICATED_REGISTRATION_REDIRECTS=False'))

		if not self.registration_allowed():
		    return redirect(self.disallowed_url)
		return super(RegistrationView, self).dispatch(request, *args, **kwargs)

	def get_success_url(self, user):
		return '/posts/list/'

	def register(self, form_class):
		new_user = super(MyRegistrationView, self).register(form_class)
		first_name = form_class.cleaned_data['first_name']
		last_name = form_class.cleaned_data['last_name']
		bio = form_class.cleaned_data['bio']
		avatar = form_class.cleaned_data['avatar']
		new_profile = Profile.objects.create(user=new_user, bio=bio, avatar=avatar)
		new_profile.save()
		return new_user

def ProfileView(request, username=None):
	if request.user.username == username:
		is_user = True
	else:
		is_user = False

	user = get_object_or_404(User, username=username)

	context = {
		"user": user,
		"is_user": is_user,
	}
	return render(request, "profile.html", context)

def SettingView(request, username=None):
	if request.user.username == username:
		is_user = True
	else:
		is_user = False

	user = get_object_or_404(User, username=username)

	context = {
		"user": user,
		"is_user": is_user,
	}
	return render(request, "settings.html", context)

# def login_view(request):
# 	next = request.GET.get('next')
# 	title = "Login"
# 	form = UserLoginForm(request.POST or None)
# 	if form.is_valid():
# 		username = form.cleaned_data.get("username")
# 		password = form.cleaned_data.get("password")
# 		user = authenticate(username=username, password=password)
# 		login(request, user)
# 		if next:
# 			return redirect(next)
# 		return redirect("/")

# 	return render(request, "form.html", {"form":form, "title":title})

# def register_view(request):
# 	title = "Register"
# 	next = request.GET.get('next')
# 	form = UserRegisterForm(request.POST or None)
# 	if form.is_valid():
# 		user = form.save(commit=False)
# 		password = form.cleaned_data.get('password')
# 		user.set_password(password)
# 		user.save()

# 		new_user = authenticate(username=user.username, password=password)
# 		login(request, new_user)
# 		if next:
# 			return redirect(next)
# 		return redirect("/")

# 	context = {
# 		"title": title,
# 		"form": form,
# 	}
# 	return render(request, "form.html", context)

# def logout_view(request):
# 	logout(request)
# 	return redirect("/../")