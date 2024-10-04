import os
from django.core.wsgi import get_wsgi_application
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "deepsight.settings")


BASE_DIR = Path(__file__).resolve().parent.parent


application = get_wsgi_application()
application.add(BASE_DIR / "static", "/static")