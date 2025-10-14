export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import axios from "axios";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let liveProfileData = [];

    const user = await User.findOne({ email: session.user.email }).select(
      "-password -twoFactorSecret -sessions"
    );

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/users/profile/${session.user.email}`
      );

      liveProfileData = data.response;
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: liveProfileData._id,
        name: `${liveProfileData.firstName} ${liveProfileData.lastName}`,
        email: liveProfileData.email,
        bio: liveProfileData.bio || "",
        location: liveProfileData.location || "",
        phone: liveProfileData.phoneNumber || "",
        company: user.company || "",
        website: user.website || "",
        profilePicture: user.profilePicture,
        contentCreatedCount: user.contentCreatedCount,
        aiGenerationsCount: user.aiGenerationsCount,
        joinDate: user.createdAt,
        userSubscriptionLevel: user.userSubscriptionLevel,
        isOnboarded: user.isOnboarded,
        passwordChangedAt: user.passwordChangedAt,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, location, phone, company, website } = body;

    await dbConnect();

    // Validate input
    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 250) {
        return NextResponse.json(
          { error: "Bio cannot be more than 250 characters" },
          { status: 400 }
        );
      }
      updateData.bio = bio.trim();
    }

    if (location !== undefined) {
      updateData.location = location.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (company !== undefined) {
      if (company.length > 100) {
        return NextResponse.json(
          { error: "Company name cannot be more than 100 characters" },
          { status: 400 }
        );
      }
      updateData.company = company.trim();
    }

    if (website !== undefined) {
      updateData.website = website.trim();
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      {
        new: true,
        runValidators: true,
        select: "-password -passwordConfirm -twoFactorSecret -sessions",
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
        company: user.company || "",
        website: user.website || "",
        profilePicture: user.profilePicture,
        contentCreatedCount: user.contentCreatedCount,
        aiGenerationsCount: user.aiGenerationsCount,
        joinDate: user.createdAt,
        userSubscriptionLevel: user.userSubscriptionLevel,
        isOnboarded: user.isOnboarded,
        passwordChangedAt: user.passwordChangedAt,
      },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("validation failed")) {
      return NextResponse.json(
        { error: "Validation failed. Please check your input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find and update user to set isActive to false (soft delete)
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { isActive: false },
      { new: true, select: "+isActive" }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
