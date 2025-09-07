"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  CheckCircle,
  AlertCircle,
  Video,
  Facebook,
} from "lucide-react";
import firebase from "../../lib/firebase";
import axios from "axios";

import { useRouter } from "next/navigation";

interface PlatformConnection {
  platformId: string;
  name: string;
  icon: any;
  description: string;
  isConnected: boolean;
  username?: string;
  lastSync?: string;
  syncEnabled?: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export function PlatformIntegrations() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Available platforms with their metadata
  const availablePlatforms = [
    {
      platformId: "twitter",
      name: "X (Twitter)",
      icon: Twitter,
      description: "Connect your X account to schedule and manage tweets",
    },
    {
      platformId: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      description:
        "Connect your LinkedIn profile to share professional content",
    },
    {
      platformId: "instagram",
      name: "Instagram",
      icon: Instagram,
      description: "Connect your Instagram account to share photos and stories",
    },
    {
      platformId: "tiktok",
      name: "TikTok",
      icon: Video,
      description: "Connect your TikTok account to manage short-form videos",
    },
    {
      platformId: "youtube",
      name: "YouTube",
      icon: Youtube,
      description: "Connect your YouTube channel to manage video content",
    },
    {
      platformId: "facebook",
      name: "Facebook",
      icon: Facebook,
      description: "Connect your Facebook page to manage posts and engagement",
    },
    {
      platformId: "wordpress",
      name: "WordPress",
      icon: Globe,
      description: "Connect your WordPress site to publish blog content",
    },
  ];

  const loadIntegrations = async () => {
    try {
      const response = await axios.get("/api/settings");

      if (response.data.success) {
        // Merge with available platforms metadata
        const integrations = availablePlatforms.map((platform) => {
          const existingIntegration =
            response.data.data.platformIntegrations?.find(
              (integration: any) =>
                integration.platformId === platform.platformId
            );

          return {
            ...platform,
            isConnected: existingIntegration?.isConnected || false,
            username: existingIntegration?.username,
            accessToken: existingIntegration?.accessToken,
            refreshToken: existingIntegration?.refreshToken,
            lastSync: existingIntegration?.lastSync
              ? new Date(existingIntegration.lastSync).toLocaleString()
              : undefined,
            syncEnabled: existingIntegration?.syncEnabled ?? true,
          };
        });

        setPlatforms(integrations);
      }
    } catch (error) {
      console.error(
        "Error loading platform integrations from database:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async (platformId: string) => {
    setActionLoading(platformId);

    if (!session) {
      console.error("No session found. Please log in first.");
      return;
    }

    // Check if the user is authenticated using Firebase (via email/password, for example)
    const sessionUser = session.user;

    if (!sessionUser) {
      console.error("No Firebase user found. Please log in.");
      return;
    }

    let provider;
    if (platformId === "google") {
      provider = new firebase.auth.GoogleAuthProvider();
    } else if (platformId === "facebook") {
      provider = new firebase.auth.FacebookAuthProvider();
    }

    if (provider) {
      try {
        // Trigger OAuth login via Firebase
        const result = await firebase.auth().signInWithPopup(provider);
        const linkedUser = result.user;

        console.log(`${platformId} account linked successfully:`, linkedUser);

        // Prepare the platform data
        if (!linkedUser) {
          throw new Error("Linked user is null after linking social account.");
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Get current settings first
        const currentResponse = await axios.get("/api/settings");
        const currentSettings = currentResponse.data.data;

        // Update platform integrations
        const existingIntegrations = currentSettings.platformIntegrations || [];
        const updatedIntegrations = [...existingIntegrations];

        const existingIndex = updatedIntegrations.findIndex(
          (p: any) => p.platformId === platformId
        );

        const platformData = {
          provider: platformId,
          platformId: platformId,
          providerAccountId: linkedUser.uid,
          accessToken:
            result.credential && "accessToken" in result.credential
              ? (result.credential as any).accessToken
              : undefined,
          username: linkedUser.displayName!,
          email: linkedUser.email!,
          image: linkedUser.photoURL!,
          isConnected: true,
          lastSync: new Date(),
          syncEnabled: true,
        };
        if (existingIndex >= 0) {
          updatedIntegrations[existingIndex] = platformData;
        } else {
          updatedIntegrations.push(platformData);
        }

        // Use POST request to store the data in database
        const response = await axios.post("/api/settings", {
          platformIntegrations: updatedIntegrations,
        });

        if (response.data.success) {
          await loadIntegrations(); // Reload to get updated data from database
        } else {
          console.error("Database save failed:", response.data);
          alert("Failed to save connection to database. Please try again.");
        }

        // Redirect to the profile page after successful linking
        router.push("/dashboard/settings");
      } catch (error: any) {
        console.error("Error linking social account:", error.message);
      } finally {
        setActionLoading(null);
      }
    }
  };
  const handleDisconnect = async (platformId: string) => {
    setActionLoading(platformId);
    try {
      // Simulate disconnection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get current settings first
      const currentResponse = await axios.get("/api/settings");
      const currentSettings = currentResponse.data.data;

      // Update platform integrations
      const existingIntegrations = currentSettings.platformIntegrations || [];
      const updatedIntegrations = existingIntegrations.map((integration: any) =>
        integration.platformId === platformId
          ? {
              ...integration,
              isConnected: false,
              username: undefined,
              accessToken: undefined,
              refreshToken: undefined,
              lastSync: undefined,
              syncEnabled: false,
            }
          : integration
      );

      // Use POST request to store the updated data in database
      const response = await axios.post("/api/settings", {
        platformIntegrations: updatedIntegrations,
      });

      if (response.data.success) {
        await loadIntegrations(); // Reload to get updated data from database
      } else {
        console.error("Database save failed:", response.data);
        alert("Failed to save disconnection to database. Please try again.");
      }
    } catch (error: any) {
      console.error("Error disconnecting platform:", error);
      alert("Error disconnecting platform. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6">
          Platform Integrations
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-6">
        Platform Integrations
      </h2>

      <div className="space-y-4">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;

          return (
            <div key={platform.platformId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {platform.description}
                    </p>
                    {platform.isConnected && platform.username && (
                      <p className="text-xs text-blue-600 mt-1">
                        Connected as {platform.username}
                      </p>
                    )}
                    {platform.isConnected && platform.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Last sync: {platform.lastSync}
                      </p>
                    )}
                    {platform.isConnected && platform.accessToken && (
                      <p className="text-xs text-green-600">
                        Token: {platform.accessToken.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {platform.isConnected ? (
                    <>
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.platformId)}
                        disabled={actionLoading === platform.platformId}
                      >
                        {actionLoading === platform.platformId
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Connected
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleConnect(platform.platformId)}
                        disabled={actionLoading === platform.platformId}
                      >
                        {actionLoading === platform.platformId
                          ? "Connecting..."
                          : "Connect"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
