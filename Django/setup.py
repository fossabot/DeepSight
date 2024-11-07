import json
import os
import requests
import subprocess


def download(url, dir):
    if dir is None:
        return
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        os.makedirs(os.path.dirname(dir), exist_ok=True)

        with open(dir, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    except requests.exceptions.RequestException as e:
        print(f"Error downloading from {url}: {e}")
        raise
    except OSError as e:
        print(f"Error saving file to {dir}: {e}")
        raise


def setup_models():
    with open("models.json", "r") as f:
        models_data = json.load(f)

        for model_info in models_data:
            url = model_info["url"]
            model_dir = model_info["model_dir"]
            download(url, model_dir)

            command = f"""python manage.py shell -c "
from api.models import Model, ModelCategory
category, created = ModelCategory.objects.get_or_create(category_name='{model_info['model_category']}')
Model.objects.get_or_create(
    model_name='{model_info['model_name']}',
    url='{model_info['url']}',
    model_dir='{model_dir}',
    model_format='{model_info['model_format']}',
    model_description='{model_info['model_description']}',
    model_version='{model_info['model_version']}',
    category=category
)
print('Loaded: {model_info['model_name']}')
" """
            try:
                subprocess.run(command, shell=True, check=True)
            except subprocess.CalledProcessError as e:
                print(f"Error executing command: {e}")


if __name__ == "__main__":
    setup_models()
