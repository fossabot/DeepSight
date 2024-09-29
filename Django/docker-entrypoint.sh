#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z $DB_HOST $DB_PORT; do
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

echo "Starting server"
gunicorn deepsight.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000