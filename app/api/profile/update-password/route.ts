export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user with password
    const user = await User.findOne({ email: session.user.email }).select(
      "+password"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldPassword = currentPassword;

    if (!(await user.comparePassword(oldPassword, user.password))) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = newPassword;
    user.passwordConfirm = confirmPassword;

    await user.save();

    // Fetch the updated user data to return passwordChangedAt
    const updatedUser = await User.findOne({
      email: session.user.email,
    }).select("-password -twoFactorSecret -sessions");

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      data: {
        passwordChangedAt: updatedUser?.passwordChangedAt,
      },
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
