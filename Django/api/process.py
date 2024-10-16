import numpy as np
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from tempfile import NamedTemporaryFile
import torch
import tensorflow as tf
from onnxruntime import InferenceSession
import logging
from api.models import ProcessedImage, Model

# Set up logging for error tracking
logger = logging.getLogger(__name__)

def load_model_from_binary(model_data, model_format):
    # Write the binary model data to a temporary file
    with NamedTemporaryFile(delete=False) as tmp_model_file:
        tmp_model_file.write(model_data)
        tmp_model_file.flush()  # Ensure all data is written

        # Now load the model depending on its format
        if model_format == 'tensorflow':
            return tf.keras.models.load_model(tmp_model_file.name)
        elif model_format == 'onnx':
            return InferenceSession(tmp_model_file.name)
        elif model_format == 'pytorch':
            return torch.load(tmp_model_file.name, map_location=torch.device('cpu'))  # Use CPU for loading
        elif model_format == 'tflite':
            interpreter = tf.lite.Interpreter(model_path=tmp_model_file.name)
            interpreter.allocate_tensors()
            return interpreter
        else:
            raise ValueError("Unsupported model format")

def process_image(image_instance, model_data, model_format):
    try:
        # Open the uploaded image from the binary data field
        image = Image.open(BytesIO(image_instance.binary_data))
        image = image.resize((224, 224))  # Resize to match model input dimensions
        image = image.convert('RGB')  # Ensure the image is in RGB format

        # Convert the image to a numpy array
        image_array = np.array(image, dtype=np.float32)
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension

        # Load the model from binary data
        model = load_model_from_binary(model_data, model_format)

        # Make predictions depending on the model type
        if model_format == 'tensorflow':
            prediction = model.predict(image_array)
        elif model_format == 'onnx':
            input_name = model.get_inputs()[0].name
            prediction = model.run(None, {input_name: image_array})[0]
        elif model_format == 'pytorch':
            image_tensor = torch.from_numpy(image_array).permute(0, 3, 1, 2)  # Adjust dimensions
            model.eval()  # Set model to evaluation mode
            with torch.no_grad():
                prediction = model(image_tensor).numpy()
        elif model_format == 'tflite':
            input_details = model.get_input_details()
            output_details = model.get_output_details()
            model.set_tensor(input_details[0]['index'], image_array)
            model.invoke()
            prediction = model.get_tensor(output_details[0]['index'])

        # Save the processed image to memory
        buffer = BytesIO()
        image.save(buffer, format='JPEG')
        processed_image_file = ContentFile(buffer.getvalue())

        # Create or update a ProcessedImage instance and link to the original image
        processed_image, created = ProcessedImage.objects.update_or_create(
            image=image_instance,
            defaults={
                'binary_data': processed_image_file.read(),
                'output_format': 'JPEG',
                'model': Model.objects.get(pk=image_instance.id)  # Link the processed image to the model
            }
        )

        # Update the original image's status to processed
        image_instance.is_processed = True
        image_instance.save()

        return processed_image

    except Exception as e:
        # Log any errors that occur during processing
        logger.error(f"Error processing image {image_instance.id}: {e}")
        raise e