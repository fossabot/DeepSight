from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import mediapipe as mp
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
    elif model_format == "mediapipe":
        model = None
    return model


def process(imageObject, modelObject):
    try:
        start_time = time.time()
        image = Image.open(BytesIO(imageObject.binary_data))
        model = load_model(modelObject.model_dir, modelObject.model_format)
        processed_image_file = BytesIO()

        # Google Net Models (ONNX)
        if modelObject.model_name in ["GoogleNet Age Classification Model", "GoogleNet Gender Classification Model"]:
            # Inferencing
            image = image.convert("RGB")
            image_np = np.array(image)
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            resized_image = cv2.resize(image_bgr, (224, 224))
            input_image = resized_image - np.array([104, 117, 123])
            input_image = np.transpose(input_image, [2, 0, 1])
            input_image = np.expand_dims(input_image, axis=0).astype(np.float32)

            input_name = model.get_inputs()[0].name
            output = model.run(None, {input_name: input_image})
            index = output[0].argmax()

            text = ""
            if "Gender" in modelObject.model_name:
                gender = ["Male", "Female"][index]
                text = f"Gender: {gender}"
            else:
                age = ["(0-2)", "(4-6)", "(8-12)", "(15-20)", "(25-32)", "(38-43)", "(48-53)", "(60-100)"][index]
                text = f"Age: {age}"

            image_width, image_height = image.size
            new_height = image_height + 150
            new_image = Image.new("RGB", (image_width, new_height), color=(0, 0, 0))
            new_image.paste(image, (0, 0))

            draw = ImageDraw.Draw(new_image)

            font = ImageFont.truetype("static/EudoxusSans-Bold.ttf", 40)

            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]

            text_position = ((image_width - text_width) // 2, image_height + 50)

            draw.text(text_position, text, font=font, fill="white")

            new_image.save(processed_image_file, format="JPEG")
            processed_image_file.seek(0)

        # MediaPipe Models (Face Detection using MediaPipe)
        elif modelObject.model_name == "MediaPipe Face Detection":
            # Using MediaPipe's Face Detection solution
            mp_face_detection = mp.solutions.face_detection

            with mp_face_detection.FaceDetection(min_detection_confidence=0.5) as face_detection:
                image = image.convert("RGB")
                image_np = np.array(image)
                results = face_detection.process(image_np)

                draw = ImageDraw.Draw(image)
                if results.detections:
                    for detection in results.detections:
                        bboxC = detection.location_data.relative_bounding_box
                        ih, iw, _ = image_np.shape
                        x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)
                        draw.rectangle([x, y, x + w, y + h], outline="red", width=5)

                image.save(processed_image_file, format="JPEG")
                processed_image_file.seek(0)

        # MediaPipe Models (Hand Landmark)
        elif modelObject.model_name == "MediaPipe Hand Landmark":
            mp_hands = mp.solutions.hands

            with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
                image = image.convert("RGB")
                image_np = np.array(image)
                results = hands.process(image_np)

                draw = ImageDraw.Draw(image)
                if results.multi_hand_landmarks:
                    for landmarks in results.multi_hand_landmarks:
                        for connection in mp_hands.HAND_CONNECTIONS:
                            start_idx = connection[0]
                            end_idx = connection[1]
                            x_start = int(landmarks.landmark[start_idx].x * image.width)
                            y_start = int(landmarks.landmark[start_idx].y * image.height)
                            x_end = int(landmarks.landmark[end_idx].x * image.width)
                            y_end = int(landmarks.landmark[end_idx].y * image.height)
                            draw.line([(x_start, y_start), (x_end, y_end)], fill="red", width=2)

                        for landmark in landmarks.landmark:
                            x = int(landmark.x * image.width)
                            y = int(landmark.y * image.height)
                            draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill="red")

                image.save(processed_image_file, format="JPEG")
                processed_image_file.seek(0)

        # MediaPipe Models (Full Body Pose Landmark)
        elif modelObject.model_name == "MediaPipe Full Body Pose Landmark":
            mp_pose = mp.solutions.pose

            with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
                image = image.convert("RGB")
                image_np = np.array(image)
                results = pose.process(image_np)

                draw = ImageDraw.Draw(image)
                if results.pose_landmarks:
                    for connection in mp_pose.POSE_CONNECTIONS:
                        start_idx = connection[0]
                        end_idx = connection[1]
                        x_start = int(results.pose_landmarks.landmark[start_idx].x * image.width)
                        y_start = int(results.pose_landmarks.landmark[start_idx].y * image.height)
                        x_end = int(results.pose_landmarks.landmark[end_idx].x * image.width)
                        y_end = int(results.pose_landmarks.landmark[end_idx].y * image.height)
                        draw.line([(x_start, y_start), (x_end, y_end)], fill="red", width=2)

                    for landmark in results.pose_landmarks.landmark:
                        x = int(landmark.x * image.width)
                        y = int(landmark.y * image.height)
                        draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill="red")

                image.save(processed_image_file, format="JPEG")
                processed_image_file.seek(0)

        # YOLO Models (Ultralytics)
        elif modelObject.model_name == "YOLO v11 Object Detection (Best Model)":
            # Inferencing
            results = model(image)[0]

            # Drawing
            plot = results.plot()
            im_bytes = cv2.imencode(".jpg", plot)[1].tobytes()
            processed_image_file.write(im_bytes)
            processed_image_file.seek(0)

        processed_image = ProcessedImage.objects.create(image=imageObject, model=modelObject, output_format="JPEG", binary_data=processed_image_file.getvalue(), processing_time=datetime.now() - datetime.fromtimestamp(start_time))

        imageObject.is_processed = True
        imageObject.save()

        return processed_image

    except Exception as e:
        print(f"Error during processing: {e}")
        return None
