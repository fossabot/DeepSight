"use client";

import { apiFetch } from "@/utils/api";
import React, { useState, useEffect } from "react";

const ViewProcessedPage: React.FC = () => {
  const [processedImageBlobs, setProcessedImageBlobs] = useState<
    { id: string; blobUrl: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessedImages = async () => {
    try {
      const response = await apiFetch("/user/processedimage/");
      const data = await response.json();
      const images = data.data.map((image: { id: string }) => ({
        id: image.id,
        blobUrl: "",
      }));
      setProcessedImageBlobs(images);
      await fetchImageBlobs(images);
    } catch (error) {
      console.error("Error fetching processed images:", error);
      setError("Failed to load processed images.");
    }
  };

  const fetchImageBlobs = async (images: { id: string }[]) => {
    try {
      const blobs = await Promise.all(
        images.map(async (image) => {
          const response = await apiFetch(`/user/processedimage/${image.id}/`);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch processed image with ID: ${image.id}`,
            );
          }
          const blob = await response.blob();
          return { id: image.id, blobUrl: URL.createObjectURL(blob) };
        }),
      );
      setProcessedImageBlobs(blobs);
    } catch (error) {
      console.error("Error fetching image blobs:", error);
      setError("Failed to load processed image blobs.");
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await apiFetch(`/user/processedimage/${id}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProcessedImageBlobs((prevImages) =>
          prevImages.filter((image) => image.id !== id),
        );
      } else {
        console.error("Failed to delete image");
        setError("Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("An error occurred during deletion.");
    }
  };

  useEffect(() => {
    fetchProcessedImages();
  }, []);

  return (
    <div className="image-container bg-gray-900 p-12 text-white min-h-screen flex flex-col items-center justify-center pt-40 pb-10">
      <div className="processed-images bg-white p-6 rounded-lg shadow-lg w-full max-w-xl overflow-y-auto relative z-10">
        <h2 className="text-3xl font-bold text-black mb-4">Processed Images</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="image-gallery grid grid-cols-2 gap-4">
          {processedImageBlobs.length > 0 ? (
            processedImageBlobs.map((image, index) => (
              <div key={index} className="image-item relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.id);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  title="Delete image"
                >
                  X
                </button>
                <img
                  src={image.blobUrl}
                  alt={`Processed Image ${index}`}
                  className="w-full h-auto rounded shadow-md"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-600">No processed images available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProcessedPage;
