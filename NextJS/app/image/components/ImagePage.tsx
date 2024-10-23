"use client";

import { apiFetch } from "@/utils/api";
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const ImagePage: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
    multiple: false,
  });

  useEffect(() => {
    // Fetch previously uploaded images
    const fetchUploadedImages = async () => {
      try {
        const response = await apiFetch("https://az-pune.spirax.me/api/v1/user/image");
        const data = await response.json();
        setUploadedImages(data.map((image: { id: string }) => image.id));
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchUploadedImages();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await apiFetch("https://az-pune.spirax.me/api/v1/user/image/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Refresh uploaded images after a successful upload
        const data = await response.json();
        setUploadedImages((prev) => [...prev, data.id]);
      } else {
        console.error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-container bg-gray-900">
      {/* Upload Section with Drag-and-Drop */}
      <div className="image-upload bg-white p-6 rounded-lg shadow-md text-black mb-6">
        <h2 className="text-2xl font-bold mb-4">Upload an Image</h2>
        <div
          {...getRootProps()}
          className={`dropzone w-full h-40 border-2 border-dashed rounded-lg p-4 flex items-center justify-center ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <p>Drag & drop an image here, or click to select one</p>
          )}
        </div>

        <p className="mt-4 text-gray-600">Supported formats: JPEG, PNG, JPG, GIF</p>
      </div>

      {/* Display Uploaded Images Section */}
      <div className="uploaded-images bg-white p-6 rounded-lg shadow-md text-black">
        <h2 className="text-2xl font-bold mb-4">Uploaded Images</h2>
        <div className="image-gallery grid grid-cols-2 gap-4">
          {uploadedImages.length > 0 ? (
            uploadedImages.map((id) => (
              <div key={id} className="image-item">
                <img
                  src={`https://az-pune.spirax.me/api/v1/user/image/${id}`}
                  alt={`Uploaded Image ${id}`}
                  className="w-full h-auto rounded shadow-md"
                />
              </div>
            ))
          ) : (
            <p>No images uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
