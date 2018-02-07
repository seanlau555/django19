import urllib.parse

from django.contrib import messages
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone

# Create your views here.
from comments.forms import CommentForm
from comments.models import Comment
from .models import Post
from .forms import PostForm
from .utils import get_read_time

def post_home(request):
	return render(request, "base.html")

def post_create(request):
	# if not request.user.is_staff or not request.user.is_superuser:
	# 	raise Http404

	if not request.user.is_authenticated:
		raise Http404

	# form = PostForm(request.POST or None, request.FILES or None)
	# if form.is_valid():
	# 	instance = form.save(commit=False)
	# 	instance.user = request.user
	# 	instance.save()
	# 	messages.success(request, "Successfully created")
	# 	return HttpResponseRedirect(instance.get_absolute_url())

	# if request.method == "POST":
	# 	print request.POST.get("title")
	# 	print request.POST.get("content")
	# 	Post.objects.create(title=title)
	# context = {
	# 	"form": form,
	# }
	return render(request, "post_form.html")

def post_detail(request, id=None):
	# return HttpResponse("<h1>Detail</h1>")
	# isntance = Post.objects.get(id=1)
	instance = get_object_or_404(Post, id=id)
	if not instance.published or instance.publish > timezone.now().date():
		if not request.user.is_staff or not request.user.is_superuser or not request.user == instance.user:
			raise Http404
	share_string = urllib.parse.quote(instance.content, safe='')#quote_plus(instance.content)
	
	initial_data = {
		"content_type": instance.get_content_type,
		"object_id": instance.id,
	}

	form = CommentForm(request.POST or None, initial=initial_data)
	if form.is_valid() and request.user.is_authenticated():
		c_type = form.cleaned_data.get("content_type")
		content_type = ContentType.objects.get(model=c_type)
		obj_id = form.cleaned_data.get("object_id")
		content_data = form.cleaned_data.get("content")
		parent_obj = None
		try:
			parent_id = request.POST.get("parent_id")
		except:
			parent_id = None

		if parent_id is not None:
			parent_qs = Comment.objects.filter(id=parent_id)
			if parent_qs.exists() and parent_qs.count() == 1:
				parent_obj = parent_qs.first()

		new_comment, created = Comment.objects.get_or_create(
			user = request.user,
			content_type = content_type,
			object_id = obj_id,
			content = content_data,
			parent = parent_obj,
		)
		return HttpResponseRedirect(new_comment.content_object.get_absolute_url())

	comments = instance.comments.order_by('-timestamp')

	context = {
		"title": instance.title,
		"instance": instance,
		"share_string": share_string,
		"comments": comments,
		"comment_form": form,
	}
	return render(request, "posts_detail.html", context)

def post_list(request):
	today = timezone.now().date()
	queryset_list = Post.objects.all().filter(
		(Q(draft=False) |
		(Q(draft=True) & Q(published=True))) & 
		Q(publish__lte=timezone.now()) & 
		Q(private=False)).distinct() # .filter(draft=False).filter(publish__lte=timezone.now())
	queryset_list.update(published=True)
	carousel_list = queryset_list[:3]

	query = request.GET.get("q")
	if query:
		queryset_list = queryset_list.filter(
			Q(title__icontains=query) |
			Q(content__icontains=query) |
			Q(user__first_name__icontains=query) |
			Q(user__last_name__icontains=query)
			).distinct()
	paginator = Paginator(queryset_list, 9) # Show 10 contacts per page
	page_request_var = 'page'

	page = request.GET.get(page_request_var)
	try:
		queryset = paginator.page(page)
	except PageNotAnInteger:
		# If page is not an integer, deliver first page.
		queryset = paginator.page(1)
	except EmptyPage:
		# If page is out of range (e.g. 9999), deliver last page of results.
		queryset = paginator.page(paginator.num_pages)

	# return HttpResponse("<h1>List</h1>")
	# queryset = Post.objects.all()# .order_by("-timestamp")
	context = {
		"object_list": queryset,
		"carousel_list": carousel_list,
		"title": "List",
		"page": page,
		"page_request_var": page_request_var,
		"today": today,
	}
	return render(request, "posts/post_list.html", context)

def post_update(request, id=None):
	instance = get_object_or_404(Post, id=id)
	if (not request.user.is_staff or not request.user.is_superuser) and request.user != instance.user:
		raise Http404
	form = PostForm(request.POST or None, request.FILES or None, instance=instance)
	if form.is_valid():
		instance = form.save(commit=False)
		instance.save()
		# message success
		messages.success(request, "<a href='#''>Item</a> saved", extra_tags='html_safe')
		return HttpResponseRedirect(instance.get_absolute_url())
	else:
		messages.error(request, "Not successfully saved")

	context = {
		"title": instance.title,
		"instance": instance,
		"form": form,
	}
	return render(request, "post_form.html", context)

def post_delete(request, id=None):
	instance = get_object_or_404(Post, id=id)
	instance.delete()
	messages.success(request, "Successfully deleted")
	return redirect("posts:list")

def post_draft(request, username=None):
	today = timezone.now().date()
	if request.user.username == username:
		is_user = True
	else:
		is_user = False
	target = User.objects.all().filter(username=username)
	queryset_list = Post.objects.all().filter(user=target).filter(
		(Q(draft=False) |
		(Q(draft=True) & Q(published=True))) & 
		Q(publish__lte=timezone.now()) & 
		Q(private=False)).distinct() # .filter(draft=False).filter(publish__lte=timezone.now())
	if request.user.username == username:
		queryset_list = Post.objects.all().filter(user=target)

	draft = request.GET.get("draft")
	publish = request.GET.get("publish")
	private = request.GET.get("private")

	if draft:
		if draft == "t":
			queryset_list = queryset_list.filter(draft=True)
		if draft == "f":
			queryset_list = queryset_list.filter(draft=False)
	if publish:
		if publish == "t":
			queryset_list = queryset_list.filter(publish__lte=timezone.now())
		if publish == "f":
			queryset_list = queryset_list.filter(publish__gt=timezone.now())
	if private:
		if private == "t":
			queryset_list = queryset_list.filter(private=True)
		if private == "f":
			queryset_list = queryset_list.filter(private=False)

	query = request.GET.get("q")
	if query:
		queryset_list = queryset_list.filter(
			Q(title__icontains=query) |
			Q(content__icontains=query) |
			Q(user__first_name__icontains=query) |
			Q(user__last_name__icontains=query)
			).distinct()
	paginator = Paginator(queryset_list, 5) # Show 5 contacts per page
	page_request_var = 'page'

	page = request.GET.get(page_request_var)
	try:
		queryset = paginator.page(page)
	except PageNotAnInteger:
		# If page is not an integer, deliver first page.
		queryset = paginator.page(1)
	except EmptyPage:
		# If page is out of range (e.g. 9999), deliver last page of results.
		queryset = paginator.page(paginator.num_pages)

	# return HttpResponse("<h1>List</h1>")
	# queryset = Post.objects.all()# .order_by("-timestamp")
	context = {
		"object_list": queryset,
		"title": "My Posts",
		"page": page,
		"page_request_var": page_request_var,
		"today": today,
		"now": timezone.now(),
		"is_user": is_user,
	}
	return render(request, "posts/post_list.html", context)