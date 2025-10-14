import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, fullName, password, confirmPassword, phoneNumber } =
      await request.json();

    let globalistSignupSuccess = true;
    let globalistSignupError = null;

    // Try Globalist Live signup, but don't block local user creation
    try {
      const firstName = fullName.split(" ")[0];
      const lastName = fullName.split(" ").slice(1).join(" ") || "";

      const globalistResponse = await fetch(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/auth/media-suite/sign-up`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            password,
            phoneNumber,
            role: "creator",
          }),
        }
      );
      if (!globalistResponse.ok) {
        globalistSignupSuccess = false;
        globalistSignupError = await globalistResponse.text();
        console.error("Globalist signup failed:", globalistSignupError);
      }
    } catch (err) {
      globalistSignupSuccess = false;
      globalistSignupError = err;
      console.error("Globalist signup error:", err);
    }

    // Mongoose handles all validation and hashing automatically via middleware
    const newUser = await User.create({
      email,
      name: fullName,
      password,
      passwordConfirm: confirmPassword,
      phone: phoneNumber,
    });

    if (!newUser) {
      return NextResponse.json(
        { message: "Failed to create user." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    // This error handling is still important for validation failures
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "User with this email or username already exists." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
