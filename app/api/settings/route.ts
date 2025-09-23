export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserSettings from "@/lib/models/UserSettings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Retrieve user settings
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let settings = await UserSettings.findOne({ userId });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await UserSettings.create({ userId });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST - Create or update user settings
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = session.user.id;

    // Update or create settings
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { userId, ...body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Settings saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving user settings:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update specific settings category
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Settings patch request body:", body);
    const userId = session.user.id;
    const { category, data } = body;

    console.log("Updating category:", category, "with data:", data);

    if (!category || !data) {
      return NextResponse.json(
        {
          error: "Category and data are required",
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "notifications",
      "platformIntegrations",
      "emailSettings",
      "privacy",
      "general",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${validCategories.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Update specific category
    const updateQuery = { [`${category}`]: data };
    console.log("Final update query:", { $set: updateQuery });

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updateQuery },
      { new: true, upsert: true, runValidators: true }
    );

    console.log("Updated settings:", settings);

    return NextResponse.json({
      success: true,
      data: settings,
      message: `${category} updated successfully`,
    });
  } catch (error: any) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
