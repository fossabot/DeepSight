from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    groups = models.ManyToManyField("auth.Group", related_name="api_users")
    user_permissions = models.ManyToManyField(
        "auth.Permission", related_name="api_users"
    )

    def __str__(self):
        return self.username


class Image(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="uploaded_images"
    )
    binary_data = models.BinaryField()
    is_processed = models.BooleanField(default=False)
    image_name = models.CharField(max_length=255, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    image_format = models.CharField(max_length=10)
    image_size = models.IntegerField()

    def __str__(self):
        return f"Image {self.id} (User: {self.user})"


class ModelCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class Model(models.Model):
    model_name = models.CharField(max_length=255)
    MODEL_TYPE_CHOICES = [
        ("classification", "Classification"),
        ("object_detection", "Object Detection"),
        ("segmentation", "Segmentation"),
        ("style_transfer", "Style Transfer"),
        ("super_resolution", "Super Resolution"),
        ("image_generation", "Image Generation"),
        ("other", "Other"),
    ]
    model_type = models.CharField(max_length=20, choices=MODEL_TYPE_CHOICES)
    binary_data = models.BinaryField()
    model_description = models.TextField(blank=True)
    model_version = models.CharField(max_length=50)
    accuracy = models.FloatField(null=True, blank=True)
    category = models.ForeignKey(
        ModelCategory, on_delete=models.CASCADE, related_name="models"
    )

    def __str__(self):
        return self.model_name


class ProcessedImage(models.Model):
    image = models.OneToOneField(
        Image, on_delete=models.CASCADE, related_name="processed_image"
    )
    model = models.ForeignKey(
        Model, on_delete=models.CASCADE, related_name="processed_images"
    )
    creation_date = models.DateTimeField(auto_now_add=True)
    binary_data = models.BinaryField()
    processing_time = models.DurationField(null=True, blank=True)
    output_format = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"Processed Image (Original: {self.image}, Model: {self.model})"


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    theme = models.CharField(
        max_length=10,
        choices=[
            ("light", "Light"),
            ("dark", "Dark"),
            ("systemdefault", "System Default"),
        ],
        default="systemdefault",
    )
