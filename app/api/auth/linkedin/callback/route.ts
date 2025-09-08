import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserSettings from "@/lib/models/UserSettings";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { code } = req.query;

    const {
      NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET,
      NEXT_PUBLIC_LINKEDIN_REDIRECT_URI,
    } = process.env;

    try {
      const session = await getSession({ req });

      if (!session) {
        return res
          .status(401)
          .json({ message: "You must be logged in to link a platform" });
      }

      // Step 1: Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        null,
        {
          params: {
            grant_type: "authorization_code",
            code,
            redirect_uri: NEXT_PUBLIC_LINKEDIN_REDIRECT_URI,
            client_id: NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
            client_secret: NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET,
          },
        }
      );

      const { access_token } = tokenResponse.data;

      // Step 2: Fetch LinkedIn user profile data using the access token
      const profileResponse = await axios.get(
        "https://api.linkedin.com/v2/me",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const userProfile = profileResponse.data;

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
        provider: "linkedin",
        platformId: "linkedin",
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

      // Step 3: Return user data
      res.status(200).json({
        success: true,
        user: userProfile,
        accessToken: access_token,
      });

      res.redirect("/dashboard/settings");
    } catch (error) {
      console.error("LinkedIn OAuth Error:", error);
      res.status(500).json({ error: "LinkedIn OAuth failed" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
