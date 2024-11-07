from django.contrib import admin
from .models import User, Image, ModelCategory, Model, ProcessedImage, UserSetting

admin.site.site_header = "DeepSight Image Processing"
admin.site.site_title = "DeepSight Admin"
admin.site.index_title = "Welcome to DeepSight"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")
    ordering = ("username",)


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
    list_filter = ("is_processed", "image_format", "upload_date")
    search_fields = ("image_name", "user__username")
    actions = ["mark_as_processed"]

    def mark_as_processed(self, request, queryset):
        queryset.update(is_processed=True)

    mark_as_processed.short_description = "Mark selected images as processed"


@admin.register(ModelCategory)
class ModelCategoryAdmin(admin.ModelAdmin):
    list_display = ("category_name",)
    search_fields = ("category_name",)
    ordering = ("category_name",)


@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ("model_name", "model_format", "model_version", "category")
    list_filter = ("model_format", "category")
    search_fields = ("model_name", "model_description")
    ordering = ("model_name",)


@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = (
        "image",
        "model",
        "creation_date",
        "processing_time",
        "output_format"
    )
    list_filter = ("model", "output_format", "creation_date")
    readonly_fields = ("image", "model", "creation_date", "processing_time", "output_format")
    search_fields = ("image__image_name", "model__model_name")


@admin.register(UserSetting)
class UserSettingAdmin(admin.ModelAdmin):
    list_display = ("user", "theme")
    readonly_fields = ("user",)
    list_filter = ("theme",)
