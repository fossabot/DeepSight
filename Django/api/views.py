from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Image, Model, ModelCategory, UserSetting
from .serializers import (
    ImageSerializer,
    ModelSerializer,
    ModelCategorySerializer,
    UserSerializer,
    UserSettingSerializer,
)
from .utils import *


@api_view(["GET"])
def home(request):
    return response(True, "Welcome to the DeepSight API!", {}, 200)


@api_view(["GET"])
def health(request):
    return response(True, "API is healthy!", {}, 200)


@api_view(["POST"])
def register(request):
    if (
        not request.data.get("username")
        or not request.data.get("first_name")
        or not request.data.get("last_name")
    ):
        return response(False, "Missing Fields", {}, 400)
    if not validate_email(request.data.get("email")) or not validate_password(
        request.data.get("password")
    ):
        return response(False, "Invalid Request", {}, 400)

    request.data["date_joined"] = timezone.now()
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserSetting.objects.create(user=user)
        refresh = RefreshToken.for_user(user)
        return response(
            True,
            "User registered successfully!",
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            201,
        )
    return response(False, "Failed to register user.", serializer.errors, 400)


@api_view(["POST"])
def login(request):
    if not request.data.get("username") or not request.data.get("password"):
        return response(False, "Missing Fields", {}, 400)
    
    user = authenticate(request, username=request.data["username"], password=request.data["password"])
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return response(
            True,
            "User logged in successfully!",
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            200,
        )
    else:
        return response(False, "Invalid credentials.", {}, 401)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user(request):
    user = request.user

    if request.method == "GET":
        serializer = UserSerializer(user)
        return response(True, "User data retrieved successfully!", serializer.data, 200)

    elif request.method == "PUT":
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response(
                True, "User data updated successfully!", serializer.data, 200
            )
        return response(False, "Failed to update user data.", serializer.errors, 400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_image(request):
    data = request.data.copy()
    data["user"] = request.user.id
    serializer = ImageSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return response(True, "Image uploaded successfully!", serializer.data, 201)
    return response(False, "Failed to upload image.", serializer.errors, 400)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def image(request, image_id):
    try:
        image = Image.objects.get(pk=image_id, user=request.user)
    except Image.DoesNotExist:
        return response(False, "Image not found.", {}, 404)

    if request.method == "GET":
        serializer = ImageSerializer(image)
        return response(
            True, "Image data retrieved successfully!", serializer.data, 200
        )

    elif request.method == "PUT":
        serializer = ImageSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response(
                True, "Image data updated successfully!", serializer.data, 200
            )
        return response(False, "Failed to update image data.", serializer.errors, 400)

    elif request.method == "DELETE":
        image.delete()
        return response(True, "Image deleted successfully!", {}, 204)


@api_view(["GET"])
def model_categories(request):
    categories = ModelCategory.objects.all()
    serializer = ModelCategorySerializer(categories, many=True)
    return response(
        True, "Model categories retrieved successfully!", serializer.data, 200
    )


@api_view(["GET"])
def models(request):
    models = Model.objects.all()
    serializer = ModelSerializer(models, many=True)
    return response(True, "Models retrieved successfully!", serializer.data, 200)


@api_view(["GET"])
def model_details(request, model_id):
    try:
        model = Model.objects.get(pk=model_id)
    except Model.DoesNotExist:
        return response(False, "Model not found.", {}, 404)

    serializer = ModelSerializer(model)
    return response(True, "Model data retrieved successfully!", serializer.data, 200)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_settings(request):
    settings = UserSetting.objects.get(user=request.user)

    if request.method == "GET":
        serializer = UserSettingSerializer(settings)
        return response(
            True, "User settings retrieved successfully!", serializer.data, 200
        )

    elif request.method == "PUT":
        serializer = UserSettingSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response(
                True, "User settings updated successfully!", serializer.data, 200
            )
        return response(
            False, "Failed to update user settings.", serializer.errors, 400
        )
