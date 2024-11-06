"use client";

import React from "react";
import Link from "next/link";

const HomePage: React.FC = () => {
  return (
    <div className="home-container bg-gray-900">
      <h1 className="home-title">Welcome to DeepSight</h1>
      <p className="home-description">
        Explore, upload, and process images with advanced models.
      </p>
      <Link href="/image" className="home-button">
        Get Started
      </Link>
    </div>
  );
};

export default HomePage;
