from django.conf import settings
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from django.core.files.uploadedfile import InMemoryUploadedFile
from .process import process
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def image(request):
    images = Image.objects.filter(user=request.user)
    data = [{"id": image.id} for image in images]
    return response(True, "Image IDs retrieved successfully!", data, 200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@csrf_protect
def upload_image(request):
    if "image" not in request.FILES:
        return response(False, "No image provided.", {}, 400)

    image_file: InMemoryUploadedFile = request.FILES["image"]

    data = {
        "image_name": image_file.name,
        "image_format": image_file.content_type.split("/")[1],
        "image_size": image_file.size,
    }

    serializer = ImageSerializer(data=data)
    if serializer.is_valid():
        image_instance = serializer.save(user=request.user)
        image_instance.binary_data = image_file.read()
        image_instance.save()
        return response(
            True,
            "Image uploaded successfully!",
            {
                "id": image_instance.id,
                "image_name": image_instance.image_name,
                "upload_date": image_instance.upload_date,
                "image_format": image_instance.image_format,
                "image_size": image_instance.image_size,
            },
            201,
        )
    return response(False, "Failed to upload image.", serializer.errors, 400)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
@csrf_protect
def image_id(request, image_id):
    try:
        image = Image.objects.get(pk=image_id, user=request.user)
    except Image.DoesNotExist:
        return response(False, "Image not found.", {}, 404)

    if request.method == "GET":
        httpresponse = HttpResponse(content=image.binary_data, content_type=image.image_format)
        httpresponse["Content-Disposition"] = f'attachment; filename="{image.image_name}"'
        return httpresponse

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
        "url": model.url,
        "model_name": model.model_name,
        "model_format": model.model_format,
        "model_description": model.model_description,
        "model_version": model.model_version,
        "category": model.category.category_name.capitalize(),
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
@csrf_protect
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

    processed_image = process(image_instance, model_instance)

    if processed_image is None:
        return JsonResponse({"success": False, "message": "Failed to process image."}, status=500)

    response = HttpResponse(content=processed_image.binary_data, content_type="image/jpeg")
    response["Content-Disposition"] = f'attachment; filename="processed_image_{processed_image.id}.jpg"'

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def processed_image(request):
    processed_images = ProcessedImage.objects.filter(image__user=request.user)
    data = [{"id": image.id} for image in processed_images]
    return response(True, "Processed image IDs retrieved successfully!", data, 200)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def processed_image_id(request, processed_image_id):
    try:
        processed_image = ProcessedImage.objects.get(pk=processed_image_id, image__user=request.user)
    except ProcessedImage.DoesNotExist:
        return response(False, "Processed image not found.", {}, 404)

    if request.method == "GET":
        httpresponse = HttpResponse(content=processed_image.binary_data, content_type="image/jpeg")
        httpresponse["Content-Disposition"] = f'attachment; filename="processed_image_{processed_image.id}.jpg"'
        return httpresponse

    elif request.method == "DELETE":
        processed_image.delete()
        return response(True, "Processed image deleted successfully!", {}, 204)
