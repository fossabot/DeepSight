from django.contrib import admin
from .models import User, Image, ModelCategory, Model, ProcessedImage, UserSetting


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "password")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = (
        "image_name",
        "user",
        "upload_date",
        "is_processed",
        "image_format",
        "image_size",
    )
    list_filter = ("is_processed", "image_format")
    search_fields = ("image_name", "user__username")
    actions = ["mark_as_processed"]

    def mark_as_processed(self, request, queryset):
        queryset.update(is_processed=True)

    mark_as_processed.short_description = "Mark selected images as processed"


@admin.register(ModelCategory)
class ModelCategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ("model_name", "model_type", "model_version", "accuracy", "category")
    list_filter = ("model_type", "category")
    search_fields = ("model_name", "model_description")


@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = (
        "image",
        "model",
        "creation_date",
        "processing_time",
        "output_format",
    )
    list_filter = ("model", "output_format")
    readonly_fields = ("image", "model", "creation_date", "processing_time")


@admin.register(UserSetting)
class UserSettingAdmin(admin.ModelAdmin):
    list_display = ("user", "theme")
    readonly_fields = ("user",)
