"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

const UserProfile: React.FC = () => {
  const router = useRouter();
  const initialStoredProfile =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userProfile") || "{}")
      : {};
  const initialStoredTheme =
    typeof window !== "undefined"
      ? localStorage.getItem("userTheme") || ""
      : "";

  const [initialProfileData, setInitialProfileData] = useState({
    username: initialStoredProfile.username || "",
    email: initialStoredProfile.email || "",
    first_name: initialStoredProfile.first_name || "",
    last_name: initialStoredProfile.last_name || "",
  });

  const [profileData, setProfileData] = useState({
    username: initialStoredProfile.username || "",
    email: initialStoredProfile.email || "",
    first_name: initialStoredProfile.first_name || "",
    last_name: initialStoredProfile.last_name || "",
    password: "",
  });

  const [theme, setTheme] = useState(initialStoredTheme);
  const [initialTheme, setInitialTheme] = useState(initialStoredTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await apiFetch("/user/profile/");
        const profileJson = await profileResponse.json();

        if (profileJson.success && profileJson.data) {
          const { username, email, first_name, last_name } = profileJson.data;
          const initialProfile = {
            username: username || "",
            email: email || "",
            first_name: first_name || "",
            last_name: last_name || "",
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("userProfile", JSON.stringify(initialProfile));
          }

          setInitialProfileData(initialProfile);
          setProfileData({ ...initialProfile, password: "" });
        }

        const themeResponse = await apiFetch("/user/settings");
        const themeJson = await themeResponse.json();

        if (typeof window !== "undefined") {
          localStorage.setItem("userTheme", themeJson.theme);
        }

        setInitialTheme(themeJson.theme);
        setTheme(themeJson.theme);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialStoredProfile.username || !initialStoredTheme) {
      fetchProfileData();
    } else {
      setIsLoading(false);
    }
  }, [initialStoredProfile.username, initialStoredTheme]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotification("");

    const updatedProfileData: { [key: string]: string } = {};
    const { username, email, first_name, last_name, password } = profileData;

    if (username !== initialProfileData.username)
      updatedProfileData.username = username;
    if (email !== initialProfileData.email) updatedProfileData.email = email;
    if (first_name !== initialProfileData.first_name)
      updatedProfileData.first_name = first_name;
    if (last_name !== initialProfileData.last_name)
      updatedProfileData.last_name = last_name;
    if (password) updatedProfileData.password = password;

    try {
      if (Object.keys(updatedProfileData).length > 0) {
        const profileUpdateResponse = await apiFetch("/user/profile/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfileData),
        });

        if (!profileUpdateResponse.ok) {
          throw new Error("Profile update failed.");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "userProfile",
            JSON.stringify({ ...initialProfileData, ...updatedProfileData }),
          );
        }
      }

      if (theme !== initialTheme) {
        const themeUpdateResponse = await apiFetch("/user/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme }),
        });

        if (!themeUpdateResponse.ok) {
          throw new Error("Theme update failed.");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("userTheme", theme);
        }
      }

      router.refresh();
      setNotification("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div className="profile-container bg-gray-900 p-12 text-white min-h-screen flex flex-col items-center justify-center relative pt-40 pb-10">
      <div className="p-12 rounded-lg shadow-lg w-full max-w-xl mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">User Profile</h2>

        {notification && (
          <div className="absolute top-4 right-4 p-2 bg-green-600 text-white rounded shadow">
            {notification}
          </div>
        )}

        <div className="form-group mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleInputChange}
            className="p-2 w-full border rounded"
            placeholder="Enter username"
          />
        </div>

        <div className="form-group mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            className="p-2 w-full border rounded"
            placeholder="Enter email"
          />
        </div>

        <div className="form-group mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-300">
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            value={profileData.first_name}
            onChange={handleInputChange}
            className="p-2 w-full border rounded"
            placeholder="Enter first name"
          />
        </div>

        <div className="form-group mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            value={profileData.last_name}
            onChange={handleInputChange}
            className="p-2 w-full border rounded"
            placeholder="Enter last name"
          />
        </div>

        <div className="form-group mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={profileData.password}
            onChange={handleInputChange}
            className="p-2 w-full border rounded"
            placeholder="Enter new password if you want to change"
          />
        </div>

        <div className="form-group mb-6">
          <label className="block text-sm font-bold mb-2 text-black">
            Theme
          </label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="p-2 w-full border rounded text-black"
          >
            <option value="systemdefault">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
