// Location: src/lib/models/User.ts

import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Define an interface for a single Login Session
export interface ISession extends Document {
  ipAddress?: string;
  userAgent?: string;
  lastUsedAt: Date;
}

// Define an interface for the User document for TypeScript
export interface IUser extends Document {
  // --- Core Identity & Credentials (from Login/Signup) ---
  email: string;
  name: string;
  password?: string;
  passwordConfirm?: string; // For password confirmation during signup

  profilePicture: string;
  bio?: string;
  location?: string;
  phone?: string;
  company?: string;
  website?: string;

  // --- OAuth Support (NEW) ---
  provider?: "credentials" | "google" | "facebook" | "twitter";
  providerId?: string;

  // --- Account Stats (from the UI) ---
  contentCreatedCount: number;
  aiGenerationsCount: number;

  // --- Security (from the UI) ---
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  sessions: ISession[];

  // --- Other Important Fields ---
  userSubscriptionLevel: "free" | "plus" | "pro"; // For future subscription plans
  isActive: boolean; // For soft-deleting an account
  planExpiresAt?: Date; // For subscription expiration

  // --- Onboarding Flow ---
  isOnboarded: boolean; // Track if user has completed onboarding
  onboardedAt?: Date; // When onboarding was completed

  createdAt: Date; // Handled by timestamps
  updatedAt: Date; // Handled by timestamps

  // --- Methods ---
  comparePassword(
    userEnteredPassword: string,
    actualPassword: string
  ): Promise<boolean>;
  createPasswordResetToken(): string;
}

// Sub-schema for login sessions
const SessionSchema: Schema = new Schema({
  ipAddress: String,
  userAgent: String,
  lastUsedAt: { type: Date, default: Date.now },
});

const UserSchema: Schema<IUser> = new Schema(
  {
    // --- Core Identity & Credentials ---
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Invalid email format.",
      },
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        // Only require password for credentials provider
        return this.provider === "credentials" || !this.provider;
      },
      select: false, // NEVER return the password by default
      validate: {
        validator: function (this: IUser, value: string) {
          // Only validate password strength for credentials provider
          if (this.provider === "credentials" || !this.provider) {
            return validator.isStrongPassword(value, {
              minLength: 8,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
            });
          }
          return true; // Skip validation for OAuth users
        },
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.",
      },
    },
    passwordConfirm: {
      type: String,
      required: function (this: IUser) {
        // Only require password confirmation for credentials provider
        return (
          (this.provider === "credentials" || !this.provider) && this.isNew
        );
      },
      validate: {
        // This only works on CREATE and SAVE, not on UPDATE
        validator: function (this: IUser, value: string) {
          return value === this.password;
        },
        message: "Passwords do not match.",
      },
    },

    // --- OAuth Support (NEW FIELDS) ---
    provider: {
      type: String,
      enum: ["credentials", "google", "facebook"],
      default: "credentials",
    },
    providerId: {
      type: String,
      sparse: true, // Allows null values but ensures uniqueness when present
    },

    // --- Profile Information ---
    profilePicture: {
      type: String,
      default: "/default-user-profile-picture.webp", // A default image path
    },
    bio: {
      type: String,
      maxlength: [250, "Bio cannot be more than 250 characters."],
    },
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) =>
          !value ||
          validator.isMobilePhone(value, "any", { strictMode: false }),
        message: "Please provide a valid phone number.",
      },
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot be more than 100 characters."],
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) =>
          !value || validator.isURL(value, { protocols: ["http", "https"] }),
        message: "Please provide a valid website URL.",
      },
    },

    // --- Account Stats ---
    contentCreatedCount: {
      type: Number,
      default: 0,
    },
    aiGenerationsCount: {
      type: Number,
      default: 0,
    },

    // --- Security ---
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false, // Also a secret, hide it by default
    },
    sessions: [SessionSchema],

    // --- Other Important Fields ---
    userSubscriptionLevel: {
      type: String,
      enum: ["free", "plus", "pro"],
      default: "free",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    planExpiresAt: {
      type: Date,
    },

    // --- Onboarding Flow ---
    isOnboarded: {
      type: Boolean,
      default: false, // New users start as not onboarded
    },
    onboardedAt: {
      type: Date,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// Modified pre-save middleware to handle OAuth users
UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified AND user is credentials-based
  if (!this.isModified("password") || this.provider !== "credentials")
    return next();

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password!, 12);

  // Delete the passwordConfirm field so it's not saved to the DB
  this.passwordConfirm = undefined;

  next();
});

// Modified password change tracking middleware
UserSchema.pre("save", function (next) {
  // If the password wasn't modified, if this is a new document, or if it's OAuth user, don't do anything
  if (
    !this.isModified("password") ||
    this.isNew ||
    this.provider !== "credentials"
  )
    return next();

  // We subtract 1 second to ensure the token is created AFTER the password is changed
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

UserSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<any, any>).find({ isActive: { $ne: false } });
  next();
});

UserSchema.methods.comparePassword = async function (
  userEnteredPassword: string,
  actualPassword: string
): Promise<boolean> {
  return await bcrypt.compare(userEnteredPassword, actualPassword);
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
