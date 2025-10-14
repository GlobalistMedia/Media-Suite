"use client";

import React from "react";
import { useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { AccountSecurity } from "@/components/profile/account-security";
import { useSession } from "next-auth/react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  Upload,
  RotateCcw,
  Loader2,
  Building,
  Globe,
} from "lucide-react";

export default function ProfilePage() {
  const { toast } = useToast();
  const { update: updateSession } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Image editing states
  const [showImageEditDialog, setShowImageEditDialog] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const {
    profileData,
    loading,
    updating,
    deletingAccount,
    updateProfile,
    uploadProfilePicture,
    deleteAccount,
    refreshProfile,
  } = useProfile();

  type EditDataType = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    location: string;
    bio: string;
    company: string;
    image: File | string;
    website: string;
  };

  const [editData, setEditData] = useState<EditDataType>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    location: "",
    bio: "",
    company: "",
    image: "",
    website: "",
  });

  const firstName = profileData?.name.split(" ")[0];
  const lastName = profileData?.name.split(" ").slice(1).join(" ") || "";
  // Initialize edit data when profile data loads
  React.useEffect(() => {
    if (profileData) {
      setEditData({
        id: profileData.id,
        firstName: firstName as string,
        lastName: lastName as string,
        email: profileData.email,
        phoneNumber: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        company: profileData.company,
        website: profileData.website,
        image: profileData.profilePicture,
      });
    }
  }, [profileData]);

  // Create canvas to generate resized image
  const createResizedImage = useCallback(
    (
      imageUrl: string,
      zoom: number,
      position: { x: number; y: number },
      size: number = 300
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();

        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          // Clear canvas with white background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);

          // Calculate image dimensions and position
          const scaledWidth = img.width * zoom;
          const scaledHeight = img.height * zoom;

          // Center the image and apply position offset
          const x = (size - scaledWidth) / 2 + position.x;
          const y = (size - scaledHeight) / 2 + position.y;

          // Draw the image
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          // Convert to blob and create URL
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve(url);
              } else {
                reject(new Error("Failed to create blob"));
              }
            },
            "image/jpeg",
            0.9
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
      });
    },
    []
  );

  // Handle image upload with editor
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImageUrl(result);
        setTempImageUrl(result);
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setShowImageEditDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain movement within reasonable bounds
      const maxMove = 150;
      setImagePosition({
        x: Math.max(-maxMove, Math.min(maxMove, newX)),
        y: Math.max(-maxMove, Math.min(maxMove, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      const maxMove = 150;
      setImagePosition({
        x: Math.max(-maxMove, Math.min(maxMove, newX)),
        y: Math.max(-maxMove, Math.min(maxMove, newY)),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset image position and zoom
  const resetImageTransform = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Save the edited image with transformations applied (just close dialog, don't upload yet)
  const handleSaveEditedImage = async () => {
    if (!originalImageUrl) return;

    try {
      // Create the resized image
      const resizedImageUrl = await createResizedImage(
        originalImageUrl,
        imageZoom,
        imagePosition,
        400 // High quality output
      );

      // Store the edited image for later upload
      setEditedImageUrl(resizedImageUrl);

      // Clean up temporary states
      setShowImageEditDialog(false);
      setTempImageUrl("");
      setOriginalImageUrl("");
      resetImageTransform();

      toast({
        title: "Image Ready",
        description:
          "Your image has been prepared. Click 'Save Changes' to apply it.",
      });
    } catch (error) {
      console.error("Error processing edited image:", error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the edited image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle camera icon click (direct image upload)
  const handleCameraClick = () => {
    // Create a temporary file input for the editor
    const tempInput = document.createElement("input");
    tempInput.type = "file";
    tempInput.accept = "image/*";
    tempInput.onchange = (e) => {
      const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(event);
    };
    tempInput.click();
  };

  // Handle cancel image editing
  const handleCancelImageEdit = () => {
    setShowImageEditDialog(false);
    setTempImageUrl("");
    setOriginalImageUrl("");
    setEditedImageUrl(null); // Clear any edited image
    resetImageTransform();
  };

  const getUserInitials = () => {
    return profileData?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSave = async () => {
    setIsSavingProfile(true);

    try {
      // First upload the edited image if there is one
      if (editedImageUrl) {
        try {
          const response = await fetch(editedImageUrl);
          const blob = await response.blob();
          const file = new File([blob], "profile-picture.jpg", {
            type: "image/jpeg",
          });

          const uploadSuccess = await uploadProfilePicture(file);

          setEditData((prev) => ({
            ...prev,
            image: file,
          }));

          if (!uploadSuccess) {
            toast({
              title: "Upload Failed",
              description:
                "Failed to upload profile picture. Please try again.",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error("Error uploading edited image:", error);
          toast({
            title: "Upload Failed",
            description: "Failed to upload profile picture. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Then update the profile data
      const success = await updateProfile(editData);
      if (success) {
        setIsEditing(false);
        setEditedImageUrl(null); // Clear the edited image after successful save

        // Update the session to reflect changes in sidebar
        await updateSession();
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    handleCancelImageEdit();
    setEditedImageUrl(null); // Clear any edited image
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 mx-0 md:mx-[5%]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4 md:p-8 mx-0 md:mx-[5%]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Unable to load profile data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 mx-0 md:mx-[5%]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={updating || isSavingProfile}
                className="flex-1 sm:flex-none"
              >
                {updating || isSavingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {updating || isSavingProfile ? "Saving..." : "Save Changes"}
                </span>
                <span className="sm:hidden">
                  {updating || isSavingProfile ? "Saving..." : "Save"}
                </span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* Left Column - Profile Summary */}
        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                  onClick={isEditing ? handleCameraClick : undefined}
                >
                  <Avatar className="w-20 h-20 md:w-24 md:h-24">
                    <AvatarImage
                      src={profileData.profilePicture}
                      alt={`${profileData.name}'s avatar`}
                    />
                    <AvatarFallback className="text-xl md:text-2xl bg-muted text-muted-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Discord-style hover overlay */}
                  {isEditing && (
                    <div
                      className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200 ${
                        isHoveringAvatar ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Discord-style edit pen */}
                {isEditing && (
                  <button
                    onClick={handleCameraClick}
                    className="absolute -bottom-2 -right-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-1.5 text-xs shadow-lg transition-colors duration-200"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              <h2 className="text-lg md:text-xl font-semibold mb-1 text-foreground">
                {profileData.name}
              </h2>
              <p className="text-muted-foreground mb-3 text-sm md:text-base">
                {profileData.email}
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-semibold mb-4 text-foreground">
              Account Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Content Created</span>
                <span className="font-medium text-foreground">
                  {profileData?.contentCreatedCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Generations</span>
                <span className="font-medium text-foreground">
                  {profileData?.aiGenerationsCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium text-foreground">
                  {profileData?.joinDate
                    ? new Date(profileData.joinDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 md:p-6 border-destructive/20 bg-card">
            <h3 className="text-lg font-semibold mb-4 text-destructive">
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5 gap-4">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-destructive/80">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to delete your account? This action cannot be undone."
                    );
                    if (confirmed) {
                      deleteAccount();
                    }
                  }}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="space-y-6">
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 text-foreground">
                    <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />

                    {profileData.name.split(" ")[0]}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 text-foreground">
                    <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profileData.name.split(" ").slice(1).join(" ")}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 text-foreground">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profileData.email}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground">
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 text-foreground">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profileData.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="text-foreground">
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Enter location"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 text-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profileData.location || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={editData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Enter company name"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profileData.company || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={editData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="mt-1"
                    placeholder="https://example.com"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profileData.website ? (
                      <a
                        href={profileData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profileData.website}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <Label htmlFor="bio" className="text-foreground">
                Bio
              </Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="mt-1 p-2 text-sm text-foreground">
                  {profileData.bio}
                </p>
              )}
            </div>
          </Card>

          {/* Account Security Component */}
          <AccountSecurity
            profileData={profileData}
            onPasswordChanged={refreshProfile}
          />
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Discord-style Image Edit Dialog - Rounded and Centered */}
      <Dialog open={showImageEditDialog} onOpenChange={setShowImageEditDialog}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border-0 p-0 overflow-y-auto bg-background">
          <div className="bg-background rounded-2xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Resize Your Image
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Adjust your image by zooming and positioning it. The final
                result will be saved permanently.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="flex justify-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 border-2 border-dashed border-border rounded-full overflow-hidden bg-muted">
                  {tempImageUrl && (
                    <div
                      className="relative w-full h-full cursor-move select-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <NextImage
                        src={tempImageUrl}
                        alt="Preview"
                        fill
                        className="object-cover pointer-events-none"
                        style={{
                          transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                        }}
                        draggable={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="zoom"
                    className="text-sm font-medium text-foreground"
                  >
                    Zoom
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(imageZoom * 100)}%
                  </span>
                </div>
                <input
                  id="zoom"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={imageZoom}
                  onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Position Info */}
              <div className="text-center text-xs text-muted-foreground">
                <p>
                  Drag the image to reposition • Position: ({imagePosition.x},{" "}
                  {imagePosition.y})
                </p>
              </div>

              {/* Upload Guidelines - Only shown in Image Edit Dialog */}
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
                <p>• Maximum size: 10MB</p>
                <p>• Transformations are saved permanently</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a temporary file input for the editor
                    const tempInput = document.createElement("input");
                    tempInput.type = "file";
                    tempInput.accept = "image/*";
                    tempInput.onchange = (e) => {
                      const event =
                        e as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleImageUpload(event);
                    };
                    tempInput.click();
                  }}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Different
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetImageTransform}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 p-4">
              <Button
                variant="outline"
                onClick={handleCancelImageEdit}
                className="w-full sm:w-auto m-2"
                disabled={isUploadingAvatar}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditedImage}
                className="w-full sm:w-auto m-2"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? "Saving..." : "OK"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
