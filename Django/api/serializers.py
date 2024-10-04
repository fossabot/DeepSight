from rest_framework import serializers
from .models import User, Image, Model, ModelCategory, ProcessedImage, UserSettings


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def update(self, instance, validated_data): 
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password) 
        return super().update(instance, validated_data)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
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


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = "__all__"
