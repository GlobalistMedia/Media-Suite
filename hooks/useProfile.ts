import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  phone: string;
  company: string;
  website: string;
  profilePicture: string;
  contentCreatedCount: number;
  aiGenerationsCount: number;
  joinDate: string;
  userSubscriptionLevel: "free" | "plus" | "pro";
  isOnboarded: boolean;
  passwordChangedAt?: string;
}

export interface UpdateProfileData {
  id?: string;
  name?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  company?: string;
  website?: string;
}

export const useProfile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { toast } = useToast();
  const { update: updateSession } = useSession();

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const result = await response.json();
      if (result.success) {
        setProfileData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      setUpdating(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/users/update-profile?id=${data?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      const result = await response.json();

      if (result.status === 200) {
        const resData = result.response;
        const profile: any = {
          id: resData._id,
          name: `${resData.firstName} ${resData.lastName}`,
          email: resData.email,
          bio: resData.bio || "",
          location: resData.location || "",
          phone: resData.phoneNumber || "",
          company: resData.company || "",
          website: resData.website || "",
          // profilePicture: resData.profilePicture || "",
          // contentCreatedCount: resData.contentCreatedCount || 0,
          // aiGenerationsCount: resData.aiGenerationsCount || 0,
          // joinDate: resData.joinDate || "",
          // userSubscriptionLevel: resData.userSubscriptionLevel || "free",
          // isOnboarded: resData.isOnboarded ?? false,
          // passwordChangedAt: resData.passwordChangedAt,
        };
        setProfileData(profile);

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });

        // Update the session to reflect changes in sidebar
        await updateSession();

        return true;
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    try {
      setUploadingPicture(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload-picture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();
      if (result.success) {
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                profilePicture: result.data.profilePicture,
              }
            : null
        );

        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });

        // Update the session to reflect changes in sidebar
        await updateSession();

        return true;
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploadingPicture(false);
    }
  };

  // Remove profile picture
  const removeProfilePicture = async (): Promise<boolean> => {
    try {
      setUploadingPicture(true);

      const response = await fetch("/api/profile/upload-picture", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove image");
      }

      const result = await response.json();
      if (result.success) {
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                profilePicture: result.data.profilePicture,
              }
            : null
        );

        toast({
          title: "Success",
          description: "Profile picture removed successfully",
        });

        // Update the session to reflect changes in sidebar
        await updateSession();

        return true;
      } else {
        throw new Error(result.error || "Failed to remove image");
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove image",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploadingPicture(false);
    }
  };

  // Delete account
  const deleteAccount = async (): Promise<boolean> => {
    try {
      setDeletingAccount(true);

      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
        });

        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);

        return true;
      } else {
        throw new Error(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeletingAccount(false);
    }
  };

  // Load profile data on mount
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    profileData,
    loading,
    updating,
    uploadingPicture,
    deletingAccount,
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture,
    deleteAccount,
    refreshProfile: fetchProfile,
  };
};
