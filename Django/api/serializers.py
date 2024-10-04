from rest_framework import serializers
from .models import User, Image, Model, ModelCategory, ProcessedImage, UserSetting


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = "__all__"
        read_only_fields = ["user", "upload_date", "is_processed"]


class ModelCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelCategory
        fields = "__all__"


class ModelSerializer(serializers.ModelSerializer):
    category = ModelCategorySerializer()

    class Meta:
        model = Model
        fields = "__all__"


class ProcessedImageSerializer(serializers.ModelSerializer):
    image = ImageSerializer()
    model = ModelSerializer()

    class Meta:
        model = ProcessedImage
        fields = "__all__"


class UserSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSetting
        fields = "__all__"