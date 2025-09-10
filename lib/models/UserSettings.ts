import mongoose, { Schema, Document } from "mongoose";

// Define interfaces for nested settings objects
export interface INotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;

  // Calendar notification preferences
  calendarNotifications: {
    events: {
      emailReminder: boolean;
      reminderTime: number; // minutes before event
      pushNotification: boolean;
    };
    meetings: {
      emailReminder: boolean;
      reminderTime: number; // minutes before meeting
      pushNotification: boolean;
    };
    scheduledPosts: {
      emailReminder: boolean;
      reminderTime: number; // minutes before post
      pushNotification: boolean;
    };
  };
}

export interface IPlatformIntegration {
  platformId: string; // "X", "linkedin", "instagram", "tiktok", "youtube", "facebook", "wordpress"
  isConnected: boolean;
  username?: string;
  accessToken?: string; // encrypted
  refreshToken?: string; // encrypted
  lastSync?: Date;
  syncEnabled: boolean;
}

export interface ISubscriber {
  id: string;
  email: string;
  name?: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string; // how they were added (manual, import, form, etc.)
}

export interface IEmailListSettings {
  lists: {
    id: string;
    name: string;
    description: string;
    status: "active" | "paused";
    tags: string[];
    createdAt: Date;
    subscribers: ISubscriber[];
    // Computed fields
    subscriberCount: number;
  }[];
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface IPrivacySettings {
  profileVisibility: boolean;
  dataCollection: boolean;
  analyticsSharing: boolean;
  marketingCommunications: boolean;
  thirdPartyIntegrations: boolean;
}

export interface IGeneralSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  weekStart: "monday" | "sunday";
  theme: "light" | "dark" | "system";
}

// Main UserSettings interface
export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;

  // Settings categories
  notifications: INotificationSettings;
  platformIntegrations: IPlatformIntegration[];
  emailSettings: IEmailListSettings;
  privacy: IPrivacySettings;
  general: IGeneralSettings;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Notification settings sub-schema
const NotificationSettingsSchema = new Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true },

    // Calendar notification preferences
    calendarNotifications: {
      events: {
        emailReminder: { type: Boolean, default: true },
        reminderTime: { type: Number, default: 15, min: 0 }, // minutes before event
        pushNotification: { type: Boolean, default: true },
      },
      meetings: {
        emailReminder: { type: Boolean, default: true },
        reminderTime: { type: Number, default: 30, min: 0 }, // minutes before meeting
        pushNotification: { type: Boolean, default: true },
      },
      scheduledPosts: {
        emailReminder: { type: Boolean, default: false }, // Default false for posts
        reminderTime: { type: Number, default: 5, min: 0 }, // minutes before post
        pushNotification: { type: Boolean, default: true },
      },
    },
  },
  { _id: false }
);

// Platform integration sub-schema
const PlatformIntegrationSchema = new Schema(
  {
    platformId: {
      type: String,
      enum: [
        "X",
        "linkedin",
        "instagram",
        "tiktok",
        "youtube",
        "facebook",
        "wordpress",
      ],
      required: true,
    },
    isConnected: { type: Boolean, default: false },
    username: { type: String },
    accessToken: { type: String }, // Should be encrypted in production
    refreshToken: { type: String }, // Should be encrypted in production
    lastSync: { type: Date },
    syncEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

// Email settings sub-schema
const SubscriberSchema = new Schema(
  {
    id: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    source: { type: String, default: "manual" },
  },
  { _id: false }
);

const EmailListSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "paused"], default: "active" },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    subscribers: [SubscriberSchema],
    subscriberCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const EmailListSettingsSchema = new Schema(
  {
    lists: [EmailListSchema],
    trackOpens: { type: Boolean, default: true },
    trackClicks: { type: Boolean, default: true },
  },
  { _id: false }
);

// Privacy settings sub-schema
const PrivacySettingsSchema = new Schema(
  {
    profileVisibility: { type: Boolean, default: true },
    dataCollection: { type: Boolean, default: false },
    analyticsSharing: { type: Boolean, default: true },
    marketingCommunications: { type: Boolean, default: false },
    thirdPartyIntegrations: { type: Boolean, default: true },
  },
  { _id: false }
);

// General settings sub-schema
const GeneralSettingsSchema = new Schema(
  {
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    timeFormat: { type: String, enum: ["12h", "24h"], default: "12h" },
    weekStart: { type: String, enum: ["monday", "sunday"], default: "monday" },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
  },
  { _id: false }
);

// Main UserSettings Schema
const UserSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One settings document per user
    },

    notifications: { type: NotificationSettingsSchema, default: {} },
    platformIntegrations: [PlatformIntegrationSchema],
    emailSettings: { type: EmailListSettingsSchema, default: {} },
    privacy: { type: PrivacySettingsSchema, default: {} },
    general: { type: GeneralSettingsSchema, default: {} },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
UserSettingsSchema.index({ "platformIntegrations.platformId": 1 });

// Export the model
const UserSettings =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);

export default UserSettings;
