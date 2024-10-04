#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z deepsight-db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

echo "Collecting static files"
python manage.py collectstatic --noinput --clear

echo "Compressing static files"
python -m blacknoise.compress static/

echo "Applying database migrations"
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Creating superuser: $DJANGO_SUPERUSER_USERNAME"
python manage.py createsuperuser --noinput

if [ "$DEBUG" = "1" ]; then
  echo "Running server in DEBUG mode"
  python manage.py runserver
else
  echo "Running server in PRODUCTION mode"
  gunicorn deepsight.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
fi