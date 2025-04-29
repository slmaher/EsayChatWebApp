import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import React from "react";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [tempImg, setTempImg] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64Image = reader.result;
        console.log("Image loaded successfully");
        setTempImg(base64Image);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Error reading image file");
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast.error("Error reading image file");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!tempImg) {
      toast.error("Please select an image first");
      return;
    }

    try {
      console.log("Starting image upload process...");
      const loadingToast = toast.loading("Updating profile picture...");
      
      // Extract the base64 data from the data URL
      const base64Data = tempImg.split(',')[1];
      console.log("Base64 data extracted, length:", base64Data.length);
      
      console.log("Sending request to update profile...");
      await updateProfile({ profilePic: base64Data });
      console.log("Profile update request completed");
      
      toast.dismiss(loadingToast);
      toast.success("Profile picture updated successfully");
      
      // Update the selected image after successful upload
      setSelectedImg(tempImg);
      console.log("Local state updated with new image");
      
      // Clear the temp image
      setTempImg(null);
      
      // Reload the page after a short delay to ensure all components update
      console.log("Reloading page in 1 second...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || "Failed to update profile picture. Please try again.");
      setSelectedImg(null);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={tempImg || selectedImg || authUser?.profilePic || "/1.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
                onError={(e) => {
                  console.error("Error loading image, using fallback");
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/1.png";
                }}
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageSelect}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            {tempImg && !isUpdatingProfile && (
              <button
                onClick={handleSaveImage}
                className="btn btn-primary btn-sm"
                disabled={isUpdatingProfile}
              >
                Save Photo
              </button>
            )}
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : tempImg
                ? "Click Save to update your photo"
                : "Click the camera icon to select a photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
