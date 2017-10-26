from urllib import quote_plus

from django.contrib import messages
from django.contrib.contenttypes.models import ContentType
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

	print request.user

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

def post_detail(request, slug=None):
	# return HttpResponse("<h1>Detail</h1>")
	# isntance = Post.objects.get(id=1)
	instance = get_object_or_404(Post, slug=slug)
	if instance.draft or instance.publish > timezone.now().date():
		if not request.user.is_staff or not request.user.is_superuser:
			raise Http404
	share_string = quote_plus(instance.content)
	
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

	comments = instance.comments

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
	queryset_list = Post.objects.active() # .filter(draft=False).filter(publish__lte=timezone.now())
	if request.user.is_staff or request.user.is_superuser:
		queryset_list = Post.objects.all()

	query = request.GET.get("q")
	if query:
		queryset_list = queryset_list.filter(
			Q(title__icontains=query) |
			Q(content__icontains=query) |
			Q(user__first_name__icontains=query) |
			Q(user__last_name__icontains=query)
			).distinct()
	paginator = Paginator(queryset_list, 10) # Show 10 contacts per page
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
		"title": "List",
		"page": page,
		"page_request_var": page_request_var,
		"today": today,
	}
	return render(request, "post_list.html", context)

def post_update(request, slug=None):
	if not request.user.is_staff or not request.user.is_superuser:
		raise Http404
	instance = get_object_or_404(Post, slug=slug)
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

def post_delete(request, slug=None):
	instance = get_object_or_404(Post, slug=slug)
	instance.delete()
	messages.success(request, "Successfully deleted")
	return redirect("posts:list")