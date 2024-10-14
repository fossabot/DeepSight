from django.urls import path
from . import views

urlpatterns = [
    # API Related
    path("", views.home, name="home"),
    path("health", views.health, name="health"),
    # Auth Related
    path("auth/register", views.register, name="register"),
    path("auth/login", views.login.as_view(), name="login"),
    path("auth/token/verify", views.token_verify.as_view(), name="token_verify"),
    path("auth/token/refresh", views.token_refresh.as_view(), name="token_refresh"),
    path("auth/logout", views.logout.as_view(), name="logout"),
    # User Related
    path("user/profile", views.user, name="user"),
    path("user/settings", views.user_settings, name="user_settings"),
    # Image Related
    path("user/image/upload", views.upload_image, name="upload_image"),
    path("user/image/<int:image_id>", views.image, name="image"),
    # Model Categories Related
    path("model_categories", views.model_categories, name="model_categories"),
    # Model Related
    path("models", views.models, name="model"),
    path("models/<int:model_id>", views.model_details, name="model_detail"),
    # Processed Image Related
    path("image/<int:image_id>/process/<int:model_id>", views.process_image, name="process_image"),
    path("processed_image/<int:processed_image_id>", views.processed_image, name="processed_image"),
]
