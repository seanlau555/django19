from rest_framework.serializers import ModelSerializer, HyperlinkedIdentityField, SerializerMethodField

from accounts.api.serializers import UserDetailSerializer
from comments.api.serializers import CommentSerializer
from comments.models import Comment
from posts.models import Post, PostImage

post_detail_url = HyperlinkedIdentityField(
		view_name="posts-api:detail",
		lookup_field='id'
	)

class PostCreateUpdateSerializer(ModelSerializer):
	class Meta:
		model = Post
		fields = [
			'id',
			'title',
			'content',
			'content_html',
			'publish',
			'image',
			'read_time',
			'draft',
			'private',
			'published',
			'content_display',
		]

class PostImageCreateSerializer(ModelSerializer):
	class Meta:
		model = PostImage
		fields = [
			'imageid',
			'image',
		]

class PostListSerializer(ModelSerializer):
	url = post_detail_url
	user = UserDetailSerializer(read_only=True)
	class Meta:
		model = Post
		fields = [
			'url',
			'user',
			'title',
			'slug',
			'content',
			'content_html',
			'publish',
			'image',
		]

class PostDetailSerializer(ModelSerializer):
	url = post_detail_url
	user = UserDetailSerializer(read_only=True)
	comment = SerializerMethodField()
	class Meta:
		model = Post
		fields = [
			'url',
			'user',
			'id',
			'id',
			'title',
			'content',
			'content_html',
			'publish',
			'image',
			'read_time',
			'draft',
			'private',
			'published',
			'content_display',
			'comment',
		]

	def get_comment(self, obj):
		# content_type = obj.get_content_type
		# object_id = obj.id
		c_qs = Comment.objects.filter_by_instance(obj)
		comments = CommentSerializer(c_qs, many=True).data
		return comments
"""

data = {
	"title": "wabalabadubdub",
	"content": "I'm in great pain",
	"publish": "2017-1-1",
	"slug": "wabalabadubdub"
}

new_item = PostSerializer(data=data)
if new_item.is_valid():
	new_item.save()
else:
	print(new_item.errors)

"""