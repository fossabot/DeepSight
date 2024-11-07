"use client";

import { apiFetch } from "@/utils/api";
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const ImagePage: React.FC = () => {
  const [imageBlobs, setImageBlobs] = useState<
    { id: string; blobUrl: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    multiple: false,
  });

  const fetchUploadedImages = async () => {
    try {
      const response = await apiFetch("/user/image/");
      const data = await response.json();
      const images = await Promise.all(
        data.data.map(async (image: { id: string }) => {
          const blobUrl = await fetchImageBlob(image.id);
          return { id: image.id, blobUrl };
        }),
      );
      setImageBlobs(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images.");
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchImageBlob = async (id: string): Promise<string> => {
    try {
      const response = await apiFetch(`/user/image/${id}/`);
      if (!response.ok) throw new Error(`Failed to fetch image with ID: ${id}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image blob:", error);
      setError("Failed to load image blob.");
      return "";
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await apiFetch(
        "/user/image/upload/",
        {
          method: "POST",
          body: formData,
        },
        true,
        false,
      );

      if (response.ok) {
        await fetchUploadedImages();
      } else {
        const errorData = await response.json();
        console.error("Image upload failed:", errorData);
        setError("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await apiFetch(`/user/image/${id}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        setImageBlobs((prevBlobs) =>
          prevBlobs.filter((image) => image.id !== id),
        );
      } else {
        console.error("Failed to delete image with ID:", id);
        setError("Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("An error occurred during deletion.");
    }
  };

  return (
    <div className="image-container bg-gray-900 p-12 text-white min-h-screen flex flex-col items-center justify-center pt-40 pb-10">
      <div className="image-upload bg-white p-12 rounded-lg shadow-lg w-full max-w-xl mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-black mb-4">Upload an Image</h2>
        <div
          {...getRootProps()}
          className={`dropzone h-40 border-2 border-dashed flex items-center justify-center rounded-lg p-4 ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive
              ? "Drop the image here..."
              : "Drag & drop an image, or click to select one"}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Supported formats: JPEG, PNG, JPG
        </p>
      </div>

      <div className="uploaded-images bg-white p-6 rounded-lg shadow-lg w-full max-w-xl overflow-y-auto relative z-10">
        <h2 className="text-3xl font-bold text-black mb-4">Uploaded Images</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="image-gallery grid grid-cols-2 gap-4">
          {imageBlobs.length > 0 ? (
            imageBlobs.map(({ id, blobUrl }, index) => (
              <div key={id} className="image-item relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(id);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  title="Delete Image"
                >
                  X
                </button>
                <img
                  src={blobUrl}
                  alt={`Uploaded Image ${index}`}
                  className="w-full h-auto rounded shadow-md"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-600">No images uploaded yet.</p>
          )}
        </div>
      </div>

      {uploading && <p className="mt-4 text-blue-500">Uploading...</p>}
    </div>
  );
};

export default ImagePage;
