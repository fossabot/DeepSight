from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView, TokenVerifyView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .process import process_image
from django.http import HttpResponse
from .models import ProcessedImage

from .models import Image, Model, ModelCategory, UserSetting
from .serializers import (
    LoginSerializer,
    ImageSerializer,
    UserSerializer,
    UserSettingSerializer,
)


def response(success, message, data, status=200):
    return JsonResponse({"success": success, "message": message, "data": data}, status=status)


@api_view(["GET"])
def home(request):
    return response(True, "Welcome to the DeepSight API!", {}, 200)


@api_view(["GET"])
@ensure_csrf_cookie
def health(request):
    return response(True, "API is healthy!", {}, 200)


class login(TokenObtainPairView):
    serializer_class = LoginSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh_token = response.data.get("refresh")
        response.data = {"access": response.data.get("access")}
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
            path="/api/v1/auth",
            domain=".spirax.me",
            httponly=True,
            samesite="Lax",
            secure=True,
        )
        return response


@api_view(["POST"])
@csrf_protect
def register(request):
    request.data["date_joined"] = timezone.now()
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserSetting.objects.create(user=user)
        return response(
            True,
            "User registered successfully!",
            {"username": user.username, "email": user.email},
            201,
        )
    return response(False, "Failed to register user.", serializer.errors, 400)


class token_refresh(TokenRefreshView):
    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token is None:
            return JsonResponse({"success": False, "message": "Refresh token is missing."}, status=400)

        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)

        new_refresh_token = response.data.get("refresh")
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
            path="/api/v1/auth",
            domain=".spirax.me",
            httponly=True,
            samesite="Lax",
            secure=True,
        )

        response.data = {"access": response.data.get("access")}

        return response


class logout(TokenBlacklistView):
    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token is None:
            return JsonResponse({"success": False, "message": "Refresh token is missing."}, status=400)

        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)

        response.delete_cookie(
            key="refresh_token",
            path="/api/v1/auth",
            domain=".spirax.me",
            samesite="Lax",
        )
        return response


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
@csrf_protect
def user(request):
    user = request.user

    if request.method == "GET":
        return response(
            True,
            "User data retrieved successfully!",
            {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            200,
        )

    elif request.method == "PUT":
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response(
                True,
                "User data updated successfully!",
                {
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                200,
            )
        return response(False, "Failed to update user data.", serializer.errors, 400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@csrf_protect
def upload_image(request):
    data = request.data.copy()
    data["user"] = request.user.id
    serializer = ImageSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return response(
            True,
            "Image uploaded successfully!",
            {
                "id": serializer.data["id"],
                "image_name": serializer.data["image_name"],
                "upload_date": serializer.data["upload_date"],
                "image_format": serializer.data["image_format"],
                "image_size": serializer.data["image_size"],
            },
            201,
        )
    return response(False, "Failed to upload image.", serializer.errors, 400)


@api_view(["GET", "DELETE"])
@csrf_protect
def image(request, image_id):
    try:
        image = Image.objects.get(pk=image_id, user=request.user)
    except Image.DoesNotExist:
        return response(False, "Image not found.", {}, 404)

    if request.method == "GET":
        return response(
            True,
            "Image data retrieved successfully!",
            {
                "id": image.id,
                "image_name": image.image_name,
                "upload_date": image.upload_date,
                "image_format": image.image_format,
                "image_size": image.image_size,
            },
            200,
        )

    elif request.method == "DELETE":
        image.delete()
        return response(True, "Image deleted successfully!", {}, 204)


@api_view(["GET"])
def model_categories(request):
    categories = ModelCategory.objects.all()
    data = [{"id": cat.id, "category_name": cat.category_name} for cat in categories]
    return response(True, "Model categories retrieved successfully!", data, 200)


@api_view(["GET"])
def models(request):
    models = Model.objects.all()
    data = [
        {
            "id": model.id,
            "model_name": model.model_name,
        }
        for model in models
    ]
    return response(True, "Models retrieved successfully!", data, 200)


@api_view(["GET"])
def model_details(request, model_id):
    try:
        model = Model.objects.get(pk=model_id)
    except Model.DoesNotExist:
        return response(False, "Model not found.", {}, 404)

    data = {
        "id": model.id,
        "model_name": model.model_name,
        "model_type": model.model_type,
        "model_description": model.model_description,
        "model_version": model.model_version,
        "accuracy": model.accuracy,
        "category": model.category.category_name,
    }
    return response(True, "Model data retrieved successfully!", data, 200)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
@csrf_protect
def user_settings(request):
    settings = UserSetting.objects.get(user=request.user)

    if request.method == "GET":
        serializer = UserSettingSerializer(settings)
        return response(
            True,
            "User settings retrieved successfully!",
            {"theme": settings.theme},
            200,
        )

    elif request.method == "PUT":
        serializer = UserSettingSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response(
                True,
                "User settings updated successfully!",
                {"theme": settings.theme},
                200,
            )
        return response(False, "Failed to update user settings.", serializer.errors, 400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_image(request, image_id, model_id):
    try:
        image_instance = Image.objects.get(pk=image_id, user=request.user)
    except Image.DoesNotExist:
        return JsonResponse({"success": False, "message": "Image not found."}, status=404)

    try:
        model_instance = Model.objects.get(pk=model_id)
    except Model.DoesNotExist:
        return JsonResponse({"success": False, "message": "Model not found."}, status=404)

    processed_image = process_image(image_instance, model_instance.model_file, model_instance.model_format)

    return JsonResponse({"success": True, "message": "Image processed successfully!"}, status=200)


@api_view(["GET"])
def processed_image(request, processed_image_id):
    try:
        processed_image = ProcessedImage.objects.get(id=processed_image_id)
    except ProcessedImage.DoesNotExist:
        return JsonResponse({"success": False, "message": "Processed image not found."}, status=404)

    response = HttpResponse(processed_image.binary_data, content_type="image/jpeg")
    response['Content-Disposition'] = f'attachment; filename="processed_image_{processed_image_id}.jpg"'

    return response


