from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Image, Model, ModelCategory
from .serializers import (
    UserSerializer,
    ImageSerializer,
    ModelSerializer,
    ModelCategorySerializer,
)
from .utils import response


def home(request):
    return response(True, "Welcome to the DeepSight API!", {}, 200)


def health(request):
    return response(True, "API is healthy!", {}, 200)


@api_view(["POST"])
def register(request):
    """
    Registers a new user.
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
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
    """
    Logs in an existing user.
    """
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
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
    return response(False, "Invalid credentials.", {}, 401)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user(request):
    """
    Retrieves or updates user information.
    """
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
    """
    Uploads a new image.
    """
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
    """
    Retrieves, updates, or deletes an image.
    """
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
def model_category(request):
    """
    Lists all model categories or creates a new one.
    """
    categories = ModelCategory.objects.all()
    serializer = ModelCategorySerializer(categories, many=True)
    return response(
        True, "Model categories retrieved successfully!", serializer.data, 200
    )


@api_view(["GET"])
def models(request):
    """
    Lists all models
    """
    models = Model.objects.all()
    serializer = ModelSerializer(models, many=True)
    return response(True, "Models retrieved successfully!", serializer.data, 200)


@api_view(["GET"])
def model_details(request, model_id):
    """
    Retrieves a model.
    """
    try:
        model = Model.objects.get(pk=model_id)
    except Model.DoesNotExist:
        return response(False, "Model not found.", {}, 404)

    serializer = ModelSerializer(model)
    return response(True, "Model data retrieved successfully!", serializer.data, 200)