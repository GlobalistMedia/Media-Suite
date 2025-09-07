import { getSession, useSession } from "next-auth/react"; // To get the logged-in user's session
import dbConnect from "@/lib/dbConnect"; // Connect to the DB
import User from "@/lib/models/User"; // User model
import UserSettings from "@/lib/models/UserSettings"; // UserSettings model to store platform integrations
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get the logged-in user's session (from credentials login)
    const session = await getSession({ req });

    if (!session) {
      return res
        .status(401)
        .json({ message: "You must be logged in to link a platform" });
    }

    // Extract the OAuth platform data (from the frontend)
    const { provider, accessToken, refreshToken, providerAccountId, username } =
      req.body;
    if (!provider || !accessToken || !refreshToken || !providerAccountId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    // Connect to the database
    await dbConnect();

    // Get the logged-in user from the session
    const loggedInUserId = session.user.id;
    const existingUser = await User.findById(loggedInUserId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the platform integration object
    const platformIntegration = {
      platformId: provider, // 'google', 'facebook', etc.
      isConnected: true,
      username: username || `@${existingUser.name}`,
      accessToken: accessToken,
      refreshToken: refreshToken,
      providerAccountId: providerAccountId,
      lastSync: new Date(),
      syncEnabled: true,
    };

    // Retrieve the user's existing platform integrations
    let existingIntegrations = await UserSettings.findOne({
      userId: loggedInUserId,
    });

    if (!existingIntegrations) {
      // If no integrations exist, create new ones
      existingIntegrations = await UserSettings.create({
        userId: loggedInUserId,
        platformIntegrations: [platformIntegration],
      });
    } else {
      // If integrations exist, update or add the new platform integration
      const updatedIntegrations = [
        ...existingIntegrations.platformIntegrations,
      ];
      const existingPlatformIndex = updatedIntegrations.findIndex(
        (integration) => integration.providerAccountId === providerAccountId
      );

      if (existingPlatformIndex >= 0) {
        updatedIntegrations[existingPlatformIndex] = platformIntegration; // Update existing platform integration
      } else {
        updatedIntegrations.push(platformIntegration); // Add new platform integration
      }

      // Save the updated integrations
      await UserSettings.updateOne(
        { userId: loggedInUserId },
        { platformIntegrations: updatedIntegrations }
      );
    }

    return res.status(200).json({ message: "Platform successfully linked" });
  } catch (error) {
    console.error("Error connecting platform:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
