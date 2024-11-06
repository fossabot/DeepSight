from io import BytesIO
from PIL import Image, ImageDraw
import tensorflow as tf
import ultralytics
from onnxruntime import InferenceSession
from .models import ProcessedImage
from datetime import datetime
import time


def load_model(model_dir, model_format):
    if model_format == "yolo":
        model = ultralytics.YOLO(model_dir)
    elif model_format == "onnx":
        model = InferenceSession(model_dir)
    elif model_format == "tflite":
        model = tf.lite.Interpreter(model_path=model_dir)
        model.allocate_tensors()
    return model


def process(imageObject, modelObject):
    try:
        start_time = time.time()

        image = Image.open(BytesIO(imageObject.binary_data))
        model = load_model(modelObject.model_dir, modelObject.model_format)

        processed_image_file = BytesIO()

        if modelObject.model_name == "YOLOv11x Object Detection":
            results = model(image)[0]

            draw = ImageDraw.Draw(image)

            for box in results.boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                confidence = box.conf[0]
                label = results.names[int(box.cls[0])]

                draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
                draw.text((x1, y1), f"{label} {confidence:.2f}", fill="red")

            image.save(processed_image_file, format="JPEG")
            processed_image_file.seek(0)

        processed_image_size = processed_image_file.tell()

        processed_image = ProcessedImage.objects.create(
            image=imageObject,
            model=modelObject,
            output_format="JPEG",
            binary_data=processed_image_file.getvalue(),
            processing_time=datetime.now() - datetime.fromtimestamp(start_time),
            processed_image_size=processed_image_size,
        )

        imageObject.is_processed = True
        imageObject.save()

        return processed_image

    except Exception as e:
        print(e)
        return None
