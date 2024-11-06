"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";

const ProcessPage: React.FC = () => {
  const [images, setImages] = useState<{ id: string; blobUrl: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [previousProcessedImages, setPreviousProcessedImages] = useState<
    string[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUploadedImages();
    fetchModels();
    fetchPreviouslyProcessedImages();
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
      const response = await apiFetch("/models/");
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError("Failed to load models.");
    }
  };

  const fetchPreviouslyProcessedImages = async () => {
    try {
      const response = await apiFetch("/user/image/processed/");
      const data = await response.json();
      setPreviousProcessedImages(data.images);
    } catch (error) {
      console.error("Error fetching processed images:", error);
      setError("Failed to load previously processed images.");
    }
  };

  const handleImageClick = (imageId: string) => {
    setSelectedImageId(imageId);
    setIsModalOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedImageId || !selectedModelId) return;

    setProcessing(true);
    setProcessedImage(null);

    try {
      const response = await apiFetch(
        `/user/image/${selectedImageId}/process/${selectedModelId}`,
        { method: "POST" },
      );

      if (response.ok) {
        const result = await response.json();
        setProcessedImage(result.processed_image_url);
      } else {
        console.error("Processing failed:", await response.json());
      }
    } catch (error) {
      console.error("Error during processing:", error);
    } finally {
      setProcessing(false);
      setIsModalOpen(false);
      setSelectedModelId(null);
    }
  };

  return (
    <div className="process-container pt-40 pb-10">
      <h2 className="process-title">Image Processing</h2>
      <div className="image-gallery">
        {images.length > 0 ? (
          images.map((image) => (
            <img
              key={image.id}
              src={image.blobUrl}
              alt={`Image ${image.id}`}
              onClick={() => handleImageClick(image.id)}
              className="gallery-image"
            />
          ))
        ) : (
          <p className="text-gray-600">No images available.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select a Model for Processing</h3>
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
                  {model.name}
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
            <button
              onClick={() => setIsModalOpen(false)}
              className="close-modal-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {processedImage && (
        <div className="processed-image">
          <h3>Processed Image</h3>
          <img src={processedImage} alt="Processed Result" />
        </div>
      )}

      <div className="previous-images">
        <h3>Previously Processed Images</h3>
        <div className="image-gallery">
          {previousProcessedImages.length > 0 ? (
            previousProcessedImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Processed ${index}`}
                className="gallery-image"
              />
            ))
          ) : (
            <p className="text-gray-600">No previously processed images.</p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ProcessPage;
