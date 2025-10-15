import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import axios from "axios";

export const authOptions: AuthOptions = {
  // 1. CONFIGURE LOGIN PROVIDERS
  providers: [
    // Add Google Provider
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    }),

    // Add Facebook Provider
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET!,
    }),

    // Your existing Credentials Provider (unchanged)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
        rememberMe: {},
      },
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error("No credentials provided.");
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (!user) {
          return null;
        }

        // Check if user account is active
        if (!user.isOnboarded) {
          throw new Error("Account has been deleted.");
        }

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          userSubscriptionLevel: user.userSubscriptionLevel,
          isOnboarded: user.isOnboarded,
          rememberMe: credentials.rememberMe === "true", // Convert string to boolean
        };
      },
    }),
  ],

  // 2. CONFIGURE SESSION STRATEGY
  session: {
    strategy: "jwt",
  },

  // 3. ADD YOUR SECRET
  secret: process.env.NEXTAUTH_SECRET,

  // 4. CONFIGURE CUSTOM PAGES
  pages: {
    signIn: "/signin",
  },

  // 5. CALLBACKS (Extended to handle OAuth)
  callbacks: {
    // Handle OAuth sign-ins
    async signIn({ user, account, profile }) {
      // Only handle OAuth providers, let credentials flow through unchanged
      if (account?.provider === "google" || account?.provider === "facebook") {
        await dbConnect();

        // Check if user exists
        let existingUser = await User.findOne({ email: user.email }).select(
          "+isActive"
        );

        if (!existingUser) {
          // Create new user for OAuth
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            profilePicture: user.image,
            userSubscriptionLevel: "free", // Default level
            provider: account.provider,
            providerId: account.providerAccountId,
          });
        } else {
          // Check if existing user account is active
          if (!existingUser.isActive) {
            throw new Error("Account has been deleted.");
          }
        }

        // Add database info to user object
        user.id = existingUser._id.toString();
        user.userSubscriptionLevel = existingUser.userSubscriptionLevel;
        user.profilePicture = existingUser.profilePicture || user.image;
      }

      return true;
    },

    // JWT callback with OAuth support
    async jwt({ token, user, account, trigger }) {
      if (user) {
        const thirtyDays = 30 * 24 * 60 * 60;
        const oneDay = 20;

        // For OAuth, default to longer sessions; for credentials, use rememberMe
        const isOAuth =
          account?.provider === "google" || account?.provider === "facebook";
        const sessionIsLongLived = user.rememberMe || isOAuth;
        const expirationTime =
          Math.floor(Date.now() / 1000) +
          (sessionIsLongLived ? thirtyDays : oneDay);

        token.id = user.id;
        token.name = user.name;
        token.exp = expirationTime;
        token.email = user.email;
        token.profilePicture = user.profilePicture;
        token.userSubscriptionLevel = user.userSubscriptionLevel;
        token.isOnboarded = user.isOnboarded;
      }

      // Handle session updates (like when onboarding is completed)
      if (trigger === "update" && token.id) {
        try {
          await dbConnect();
          const updatedUser = await User.findById(token.id);
          if (updatedUser) {
            token.isOnboarded = updatedUser.isOnboarded;
            token.name = updatedUser.name;
            token.email = updatedUser.email;
            token.profilePicture = updatedUser.profilePicture;
            token.userSubscriptionLevel = updatedUser.userSubscriptionLevel;
          }
        } catch (error) {
          console.error("Error updating JWT token:", error);
        }
      }

      return token;
    },

    // Session callback
    async session({ session, token }) {
      if (session.user && token) {
        session.expires = new Date(token.exp * 1000).toISOString();
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.profilePicture = token.profilePicture;
        session.user.userSubscriptionLevel = token.userSubscriptionLevel;
        session.user.isOnboarded = token.isOnboarded;
      }
      return session;
    },
  },
};
