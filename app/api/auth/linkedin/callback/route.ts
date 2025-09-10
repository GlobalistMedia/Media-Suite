import axios from "axios";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserSettings from "@/lib/models/UserSettings";
import { getServerSession } from "next-auth"; // Use server-side session for app router

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const {
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET,
    NEXT_PUBLIC_LINKEDIN_REDIRECT_URI,
  } = process.env;

  try {
    const session = await getServerSession(); // or your auth session fetching logic

    if (!session) {
      return NextResponse.json(
        { message: "You must be logged in to link a platform" },
        { status: 401 }
      );
    }

    // Step 1: Exchange code for access token
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

    // Step 2: Fetch user profile
    const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userProfile = profileResponse.data;

    await dbConnect();

    let userSettings = await UserSettings.findOne({
      userId: session.user.id,
    });

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
      username: userProfile.username || null, // in case username is undefined
      accessToken: access_token,
      isConnected: true,
      lastSync: new Date(),
      syncEnabled: true,
    };

    userSettings.platformIntegrations.push(platformData);

    await userSettings.save();

    // Return JSON response
    return NextResponse.json({
      success: true,
      user: userProfile,
      accessToken: access_token,
    });
  } catch (error) {
    console.error("LinkedIn OAuth Error:", error);
    return NextResponse.json(
      { error: "LinkedIn OAuth failed" },
      { status: 500 }
    );
  }
}
