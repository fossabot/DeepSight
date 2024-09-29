from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import RedirectView

urlpatterns = [
    path("api/v1/", include("api.urls")),
    path("", RedirectView.as_view(url='/api/v1/', permanent=True)),
    path("health", RedirectView.as_view(url='/api/v1/health', permanent=True)),
    path("django/admin/", admin.site.urls),
    path("favicon.ico", RedirectView.as_view(url='/static/favicon.ico', permanent=True)),
]