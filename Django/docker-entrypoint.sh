#!/bin/sh

echo "                                                                         "
echo "                                                                         "                                                                       
echo "d8888b. d88888b d88888b d8888b. .d8888. d888888b  d888b  db   db d888888b" 
echo "88  '8D 88'     88'     88  '8D 88'  YP   '88'   88' Y8b 88   88 '~~88~~'" 
echo "88   88 88ooooo 88ooooo 88oodD' '8bo.      88    88      88ooo88    88   " 
echo "88   88 88~~~~~ 88~~~~~ 88~~~     'Y8b.    88    88  ooo 88~~~88    88   " 
echo "88  .8D 88.     88.     88      db   8D   .88.   88. ~8~ 88   88    88   " 
echo "Y8888D' Y88888P Y88888P 88      '8888Y' Y888888P  Y888P  YP   YP    YP   " 
echo "                                                                         "
echo "                                                                         "


if [ ! -f ".setup_complete" ]; then
  echo "----------------------------------------"
  echo "Starting Deepsight application setup..."
  echo "----------------------------------------"

  echo "Installing ML Libraries: Mediapipe, ONNX Runtime, and Ultralytics..."
  echo "This may take up to 5-6 minutes for the first time setup."
  pip install mediapipe==0.10.18 onnxruntime==1.19.2 ultralytics==8.3.21 --no-cache-dir --quiet || exit 1

  echo "Collecting static files..."
  python manage.py collectstatic --noinput --clear || exit 1

  echo "Compressing static files..."
  python -m blacknoise.compress static/

  echo "Creating database migrations..."
  python manage.py makemigrations --noinput || exit 1

  echo "Waiting for PostgreSQL database to start..."

  while ! nc -z deepsight-db 5432; do
    sleep 0.1
  done

  echo "PostgreSQL database started."

  echo "Applying database migrations..."
  python manage.py migrate --noinput || exit 1

  echo "Creating superuser: $DJANGO_SUPERUSER_USERNAME..."
  python manage.py createsuperuser --noinput

  echo "Setting up Models..."
  python setup.py

  touch .setup_complete
else
  echo "Waiting for PostgreSQL database to start..."

  while ! nc -z deepsight-db 5432; do
    sleep 0.1
  done

  echo "PostgreSQL database started."

  echo "Flushing expired tokens..."
  python manage.py flushexpiredtokens
fi

if [ "$DEBUG" = "True" ]; then
  echo "---------------------------------------------"
  echo "   Starting Deepsight server in DEBUG mode   "
  echo "---------------------------------------------"
  python manage.py runserver 0.0.0.0:8000
else
  echo "----------------------------------------------"
  echo " Starting Deepsight server in PRODUCTION mode " 
  echo "----------------------------------------------"
  gunicorn deepsight.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
fi