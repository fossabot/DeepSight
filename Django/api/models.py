from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    groups = models.ManyToManyField("auth.Group", related_name="api_users")
    user_permissions = models.ManyToManyField("auth.Permission", related_name="api_users")

    def __str__(self):
        return self.username


class Image(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_images")
    binary_data = models.BinaryField()
    is_processed = models.BooleanField(default=False)
    image_name = models.CharField(max_length=255, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    image_format = models.CharField(max_length=10)
    image_size = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"Image {self.id} (User: {self.user})"


class ModelCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class Model(models.Model):
    model_name = models.CharField(max_length=255, unique=True)
    url = models.URLField(blank=True)
    model_dir = models.CharField(max_length=255)
    MODEL_FORMAT_CHOICES = [
        ("yolo", "Yolo"),
        ("onnx", "ONNX"),
        ("tflite", "TFLite"),
        ("other", "Other"),
    ]
    model_format = models.CharField(max_length=20, choices=MODEL_FORMAT_CHOICES)
    model_description = models.TextField(blank=True)
    model_version = models.CharField(max_length=50)
    category = models.ForeignKey(ModelCategory, on_delete=models.CASCADE, related_name="api_models")

    def __str__(self):
        return self.model_name


class ProcessedImage(models.Model):
    image = models.OneToOneField(Image, on_delete=models.CASCADE, related_name="api_processed_image")
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name="api_processed_images")
    creation_date = models.DateTimeField(auto_now_add=True)
    binary_data = models.BinaryField()
    processing_time = models.DurationField(null=True, blank=True)
    output_format = models.CharField(max_length=10, blank=True)
    processed_image_size = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"Processed Image (Original: {self.image}, Model: {self.model}, Size: {self.processed_image_size} bytes)"


class UserSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    theme = models.CharField(
        max_length=13,
        choices=[
            ("light", "Light"),
            ("dark", "Dark"),
            ("systemdefault", "System Default"),
        ],
        default="systemdefault",
    )
