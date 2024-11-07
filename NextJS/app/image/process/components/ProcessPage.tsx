"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";

const ProcessPage: React.FC = () => {
  const [images, setImages] = useState<{ id: string; blobUrl: string }[]>([]);
  const [models, setModels] = useState<{ id: string; model_name: string }[]>(
    [],
  );
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUploadedImages();
    fetchModels();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const response = await apiFetch("/user/image/");
      const data = await response.json();
      const ids = data.data.map((image: { id: string }) => image.id);
      await fetchImageBlobs(ids);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images.");
    }
  };

  const fetchImageBlobs = async (ids: string[]) => {
    try {
      const blobs = await Promise.all(
        ids.map(async (id) => {
          const response = await apiFetch(`/user/image/${id}/`);
          if (!response.ok) {
            throw new Error(`Failed to fetch image with ID: ${id}`);
          }
          const blob = await response.blob();
          return { id, blobUrl: URL.createObjectURL(blob) };
        }),
      );
      setImages(blobs);
    } catch (error) {
      console.error("Error fetching image blobs:", error);
      setError("Failed to load image blobs.");
    }
  };

  const fetchModels = async () => {
    try {
      const response = await apiFetch(
        "/models/",
        { method: "GET" },
        false,
        true,
        false,
      );
      const data = await response.json();
      setModels(data.data);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError("Failed to load models.");
    }
  };

  const handleImageClick = (imageId: string) => {
    setSelectedImageId(imageId);
    setProcessedImage(null);
    setSelectedModelId(null);
  };

  const handleProcess = async () => {
    if (!selectedImageId || !selectedModelId) return;

    setProcessing(true);
    setProcessedImage(null);
    setError(null);

    try {
      const response = await apiFetch(
        `/user/image/${selectedImageId}/process/${selectedModelId}/`,
        { method: "POST" },
      );

      if (response.ok) {
        const blob = await response.blob();
        const processedImageUrl = URL.createObjectURL(blob);
        setProcessedImage(processedImageUrl);
      } else {
        console.error("Processing failed:", await response.json());
        setError("Processing failed.");
      }
    } catch (error) {
      console.error("Error during processing:", error);
      setError("An error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="process-container pt-40 pb-10">
      <h2 className="process-title">Image Processing</h2>

      <div className="image-gallery relative z-10">
        {images.length > 0 ? (
          images.map((image) => (
            <div
              key={image.id}
              className={`image-item ${
                selectedImageId === image.id ? "border-4 border-blue-500" : ""
              }`}
              onClick={() => handleImageClick(image.id)}
            >
              <img
                src={image.blobUrl}
                alt={`Image ${image.id}`}
                className={`gallery-image cursor-pointer ${
                  selectedImageId === image.id ? "selected-image" : ""
                }`}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-600">No images available.</p>
        )}
      </div>

      {selectedImageId && (
        <div className="model-selection relative z-10">
          <h3>Select a Model</h3>
          <select
            value={selectedModelId || ""}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="model-select"
          >
            <option value="" disabled>
              Select Model
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleProcess}
            disabled={processing || !selectedModelId}
            className="process-button"
          >
            {processing ? "Processing..." : "Process Image"}
          </button>
        </div>
      )}

      {processing && <p className="loading-spinner">Processing...</p>}

      {processedImage && (
        <div className="processed-image relative z-10">
          <h3>Processed Image</h3>
          <img
            src={processedImage}
            alt="Processed Result"
            className="processed-image-display"
          />
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ProcessPage;
