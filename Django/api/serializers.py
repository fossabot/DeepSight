import re
from rest_framework import serializers
from .models import User, Image, Model, ModelCategory, ProcessedImage, UserSetting
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


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

        # Validate email format using regex
        if (
            re.match(
                r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
                lower_email,
            )
            is None
        ):
            raise serializers.ValidationError("Invalid email format.")
        return lower_email

    def validate_password(self, value):
        # Enforce strong password requirements using regex
        if re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", value) is None:
            raise serializers.ValidationError("Password is too weak.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        exclude = ["binary_data"]
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


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token
