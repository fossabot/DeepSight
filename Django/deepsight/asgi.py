import os
from blacknoise import BlackNoise
from django.core.asgi import get_asgi_application
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "deepsight.settings")

BASE_DIR = Path(__file__).resolve().parent.parent

def immutable_file_test(path):
    return True

application = BlackNoise(
    get_asgi_application(),
    immutable_file_test=immutable_file_test,
)
application.add(BASE_DIR / "static", "/static")