import re
from rest_framework import serializers
from .models import User, Image, Model, ModelCategory, ProcessedImage, UserSetting


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "date_joined",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        lower_email = value.lower()
        if User.objects.filter(email__iexact=lower_email).exists():
            raise serializers.ValidationError("A user with that email already exists.")

        if re.match(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", lower_email) is None:
            raise serializers.ValidationError("Invalid email format.")
        return lower_email

    def validate_password(self, value):
        if re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", value) is None:
            raise serializers.ValidationError("Password is too weak.")
        return value
    
    def validate(self, data):
        if not data.get('first_name') or not data.get('last_name'):
            raise serializers.ValidationError("Name field is required.")
        
        if data.get('first_name') == "" or data.get('last_name') == "":
            raise serializers.ValidationError("Name cannot be empty.")
        return data

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
