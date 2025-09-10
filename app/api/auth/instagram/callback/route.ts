import axios from "axios";
import dbConnect from "@/lib/dbConnect";
import UserSettings from "@/lib/models/UserSettings";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    return res
      .status(401)
      .json({ message: "You must be logged in to link a platform" });
  }

  if (req.method === "GET") {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No authorization code provided" });
    }

    try {
      // Step 1: Exchange the code for an access token
      const response = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        null,
        {
          params: {
            client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID,
            client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET,
            grant_type: "authorization_code",
            redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI,
            code: code,
          },
        }
      );

      const { access_token, user_id } = response.data;

      // Step 2: Fetch the Instagram user data using the access token
      const userDataResponse = await axios.get(
        `https://graph.instagram.com/${user_id}`,
        {
          params: {
            fields: "id,username,account_type",
            access_token: access_token,
          },
        }
      );

      const userProfile = userDataResponse.data;

      // Step 3: Save the platform data to your database
      await dbConnect(); // Ensure you are connected to the database

      // Check if the user already has platform integrations saved
      let userSettings = await UserSettings.findOne({
        userId: session.user.id,
      }); // Assuming the user's ID is stored in session

      if (!userSettings) {
        userSettings = new UserSettings({
          userId: session.user.id,
          platformIntegrations: [],
        });
      }

      const platformData = {
        provider: "instagram",
        platformId: "instagram",
        providerAccountId: userProfile.id,
        username: userProfile.username,
        accessToken: access_token,
        isConnected: true,
        lastSync: new Date(),
        syncEnabled: true,
      };

      // Update the platform integrations list
      userSettings.platformIntegrations.push(platformData);

      // Save or update the user settings
      await userSettings.save();

      // Send a response to the frontend (optional: you could also redirect)
      res.status(200).json({
        success: true,
        message: "Instagram account connected successfully.",
      });

      res.redirect("/dashboard/settings");
    } catch (error) {
      console.error("Instagram OAuth Error:", error);
      res.status(500).json({ error: "Instagram OAuth failed" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
