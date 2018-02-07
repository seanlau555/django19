from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from django.db.models import Q

from profiles.models import Profile

from rest_framework.serializers import (
    CharField,
    EmailField,
	ModelSerializer,
	HyperlinkedIdentityField,
	SerializerMethodField,
	ValidationError,
	)

User = get_user_model()

class UserDetailSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
        ]

class UserCreateSerializer(ModelSerializer):
    email = EmailField(label='Email Address')
    email2 = EmailField(label='Confirm Email')
    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'email',
            'email2',
        ]
        extra_kwargs = {"password":
                            {"write_only": True}
                            }

    def validate(self, data):
        # email = data['email']
        return data

    def validate_email(self, value):
        data = self.get_initial()
        email1 = data.get("email2")
        email2 = value
        if email1 != email2:
            raise ValidationError("Emails don't match")
        user_qs = User.objects.filter(email=email2)
        if user_qs.exists():
            raise ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        user_obj = User(
                username = username,
                email = email,
            )
        user_obj.set_password(password)
        user_obj.save()
        return validated_data

class UserLoginSerializer(ModelSerializer):
    token = CharField(allow_blank=True, read_only=True)
    username = CharField(allow_blank=True, required=False)
    email = EmailField(label='Email Address', allow_blank=True, required=False)
    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'email',
            'token',
        ]
        extra_kwargs = {"password":
            {"write_only": True}
        }

    def validate(self, data):
        user_obj = None
        email = data.get("email", None)
        username = data.get("username", None)
        password = data.get("password")
        if not email and not username:
            raise ValidationError("Username or email is required")
        user = User.objects.filter(
                Q(email=email) |
                Q(username=username)
            ).distinct()
        user = user.exclude(email__isnull=True).exclude(email__iexact='')
        if user.exists() and user.count() ==1:
            user_obj = user.first()
        else:
            raise ValidationError("Such username or email is not valid")

        if user_obj:
            if not user_obj.check_password(password):
                raise ValidationError("Incorrect password")
        data["token"] = "SOME RANDOM TOKEN"
        return data

class UserUpdateSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
        ]

class ProfileUpdateSerializer(ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'avatar',
            'bio',
        ]