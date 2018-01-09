from __future__ import unicode_literals

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.db import models
from django.db.models.signals import pre_save

from django.utils import timezone
from django.utils.safestring import mark_safe
from django.utils.text import slugify

from comments.models import Comment
from markdown_deux import markdown
from .utils import get_read_time
import logging

logger = logging.getLogger(__name__)

# Create your models here.
# MVC Model View Controller

class PostManager(models.Manager):
	def active(self, *args, **kwargs):
		return super(PostManager, self).filter(draft=False).filter(publish__lte=timezone.now())

def upload_location(instance, filename):
	return "%s/%s" %(instance.slug, filename)

class Post(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, default=1) #Author
	title = models.CharField(max_length=120, null=True, blank=True)
	slug = models.SlugField(null=True, blank=True)
	image = models.TextField(null=True, blank=True) #Feature image
	height_field = models.IntegerField(default=0)
	width_field = models.IntegerField(default=0)
	content = models.TextField(null=True, blank=True) #Actual, up to date content
	content_display = models.TextField(null=True, blank=True) #Unaltered, displaying content
	content_html = models.TextField(null=True, blank=True) #preview
	draft = models.BooleanField(default=True) #True if author leave the page without saving
	private = models.BooleanField(default=False) #Set by author
	published = models.BooleanField() #True if the post is posted already
	publish = models.DateField(null=True, blank=True, auto_now=False, auto_now_add=False) #date which author want the post to be published
	timestamp = models.DateTimeField(auto_now=False, auto_now_add=True) #Create time
	updated = models.DateTimeField(auto_now=True, auto_now_add=False) #Update time
	read_time = models.IntegerField(null=True, blank=True)#No. of estimate read time in mins

	objects = PostManager()

	def __unicode__(self):
		return self.title

	def __str__(self):
		if self.title:
			return self.title
		else:
			return "None"

	def get_absolute_url(self):
		return "/posts/%s/" %(self.id)
		# if self.draft:
		# 	return ""
		# else:
		# 	return reverse("posts:detail", kwargs={"slug": self.slug})

	def get_api_url(self):
		# return "/post/%s/" %(self.id)
		return reverse("posts-api:detail", kwargs={"slug": self.slug})

	class Meta:
		ordering = ["-timestamp", "-updated"]

	def get_markdown(self):
		content = self.content
		return mark_safe(markdown(content))

	@property
	def comments(self):
		instance = self
		qs = Comment.objects.filter_by_instance(instance)
		return qs

	@property
	def get_content_type(self):
		instance = self
		content_type = ContentType.objects.get_for_model(instance.__class__)
		return content_type

def create_slug(instance, new_slug=None):
	if instance.title:
		slug = slugify(instance.title)
		if new_slug is not None:
			slug = new_slug
		qs = Post.objects.filter(slug=slug).order_by("-id")
		exists = qs.exists()
		if exists:
			new_slug = "%s-%s" %(slug, qs.first().id)
			return create_slug(instance, new_slug=new_slug)
	else:
		slug = ""
	return slug

def image_upload_location(instance, filename):
	return "%s" %(filename)

class PostImage(models.Model):
	imageid = models.ForeignKey('Post', on_delete=models.CASCADE, null=True, blank=True)
	image = models.TextField(null=True, blank=True)

def pre_save_post_receiver(sender, instance, *args, **keyargs):
	if (not instance.slug):
		instance.slug = create_slug(instance)

	# if instance.content:
	# 	html_string = instance.get_markdown()
	# 	read_time = get_read_time(html_string)
	# 	instance.read_time = read_time

pre_save.connect(pre_save_post_receiver, sender=Post)