"use client";

import { apiFetch } from "@/utils/api";
import React, { useState, useEffect } from "react";

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfileData = async () => {
      try {
        const profileResponse = await apiFetch("https://az-pune.spirax.me/api/v1/user/profile");
        const profileJson = await profileResponse.json();
        setProfileData(profileJson);

        const themeResponse = await apiFetch("https://az-pune.spirax.me/api/v1/user/settings");
        const themeJson = await themeResponse.json();
        setTheme(themeJson.theme);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update profile data
      await apiFetch("/https://az-pune.spirax.meapi/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      // Update theme
      await apiFetch("https://az-pune.spirax.me/api/v1/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container bg-gray-900 p-6 rounded-lg shadow-md text-white">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>

      <div className="form-group mb-4">
        <label className="block text-sm font-bold mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={profileData.username}
          onChange={handleInputChange}
          className="p-2 w-full border rounded"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block text-sm font-bold mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={profileData.email}
          onChange={handleInputChange}
          className="p-2 w-full border rounded"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block text-sm font-bold mb-2">First Name</label>
        <input
          type="text"
          name="firstName"
          value={profileData.firstName}
          onChange={handleInputChange}
          className="p-2 w-full border rounded"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block text-sm font-bold mb-2">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={profileData.lastName}
          onChange={handleInputChange}
          className="p-2 w-full border rounded"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block text-sm font-bold mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={profileData.password}
          onChange={handleInputChange}
          className="p-2 w-full border rounded"
        />
      </div>

      <div className="form-group mb-6">
        <label className="block text-sm font-bold mb-2">Theme</label>
        <select
          value={theme}
          onChange={handleThemeChange}
          className="p-2 w-full border rounded"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="blue">Blue</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        className="button_non_transparent"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default ProfilePage;
