"use client";

import { apiFetch } from "@/utils/api";
import React, { useState, useEffect } from "react";

interface Model {
  id: number;
  url: string;
  model_name: string;
  model_format: string;
  model_description: string;
  model_version: string;
  category: string;
}

const ModelsPage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsResponse = await apiFetch(
          "/models/",
          { method: "GET" },
          false,
          true,
          false,
        );

        const modelsJson = await modelsResponse.json();
        if (!modelsJson.success) {
          throw new Error("Failed to fetch model list.");
        }

        const modelList = modelsJson.data;
        const modelDetailsPromises = modelList.map(
          async (model: { id: number }) => {
            const modelDetailResponse = await apiFetch(
              `/models/${model.id}/`,
              { method: "GET" },
              false,
              true,
              false,
            );

            const modelDetailJson = await modelDetailResponse.json();
            if (!modelDetailJson.success) {
              throw new Error(`Failed to fetch details for model ${model.id}`);
            }

            return modelDetailJson.data;
          },
        );

        const modelDetails = await Promise.all(modelDetailsPromises);
        setModels(modelDetails);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching model data.");
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const placeholderCards = Array.from({ length: 8 }, (_, index) => (
    <div
      key={index}
      className="model-card bg-gray-300 p-6 rounded-lg shadow-md animate-pulse"
    >
      <div className="model-thumbnail-container flex justify-center mb-4">
        <div className="bg-gray-400 w-24 h-24 rounded" />
      </div>
      <div className="h-6 bg-gray-400 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-400 rounded w-full mb-2" />
      <div className="h-4 bg-gray-400 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-400 rounded w-2/3" />
    </div>
  ));

  return (
    <div className="models-container bg-gray-900 p-8 min-h-screen flex flex-col items-center pt-40 pb-10">
      <h1 className="text-5xl font-bold text-white mb-10 text-center">
        Available Models
      </h1>
      <div className="models-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-screen-xl">
        {loading ? (
          placeholderCards
        ) : error ? (
          <div className="error text-red-500">{error}</div>
        ) : (
          models.map((model) => (
            <div
              className="model-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
              key={model.id}
            >
              <div className="model-thumbnail-container flex justify-center mb-4">
                <img
                  src={`https://az-pune.spirax.me/static/${model.model_format}.png`}
                  alt={`${model.model_format} format`}
                  className="model-thumbnail w-24 h-24 rounded"
                />
              </div>
              <h2 className="model-name text-2xl font-semibold text-black mb-2">
                {model.model_name}
              </h2>
              <p className="model-description text-gray-700 mb-2 line-clamp-3">
                {model.model_description}
              </p>
              <p className="model-version text-gray-600">
                Version: {model.model_version}
              </p>
              <p className="model-category text-gray-600">
                Category: {model.category}
              </p>
              <a
                href={model.url}
                className="model-link mt-4 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Model
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModelsPage;
