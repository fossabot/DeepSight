from django.urls import path
from . import views

urlpatterns = [
    # API Related
    path("", views.home, name="home"),
    path("health", views.health, name="health"),

    # User Related
    path("register", views.register, name="register"),
    path("login", views.login, name="login"),
    path("user", views.user, name="user"),

    # Image Related
    path("image/upload", views.upload_image, name="upload_image"),
    path("image/<int:image_id>", views.image, name="image"),

    # Model Category Related
    path("model_category", views.model_category, name="model_category"),

    # Model Related
    path("model", views.model, name="model"),
    path("model/<int:model_id>", views.model_details, name="model_detail"),

    # Processed Image Related
    # path("image/<int:image_id>/process/<int:model_id>", views.process_image, name="process_image"),
    # path("processed_image/<int:processed_image_id>", views.processed_image, name="processed_image"),

    # User Settings
    # path("user/settings", views.user_settings, name="user_settings"), 
]