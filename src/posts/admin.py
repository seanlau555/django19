from django.contrib import admin

# Register your models here.
from .models import Post
from .models import PostImage

class PostModelAdmin(admin.ModelAdmin):
	list_display = ["title", "updated", "timestamp", "draft"]
	list_display_links = ["updated"]
	list_filter = ["updated", "timestamp"]
	list_editable = ["title"]
	search_fields =["title", "content"]
	class Meta:
		model = Post

admin.site.register(Post, PostModelAdmin)
admin.site.register(PostImage)
