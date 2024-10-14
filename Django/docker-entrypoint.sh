#!/bin/sh

echo "Collecting static files"
python manage.py collectstatic --noinput --clear

echo "Compressing static files"
python -m blacknoise.compress static/

echo "Creating database migrations"
python manage.py makemigrations --noinput

echo "Waiting for postgres..."

while ! nc -z deepsight-db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

echo "Applying database migrations"
python manage.py migrate --noinput

echo "Flushing expired tokens"
python manage.py flushexpiredtokens

echo "Creating superuser: $DJANGO_SUPERUSER_USERNAME"
python manage.py createsuperuser --noinput

if [ "$DEBUG" = "True" ]; then
  echo "Running server in DEBUG mode"
  python manage.py runserver 0.0.0.0:8000
else
  echo "Running server in PRODUCTION mode"
  gunicorn deepsight.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
fi