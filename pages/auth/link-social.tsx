import { useEffect, useState } from "react";
import firebase from "../../lib/firebase";
import { useSession } from "next-auth/react"; // For session management
import { useRouter } from "next/router";

// Define types for session and user data
interface User {
  name: string;
  email: string;
  profilePicture?: string;
  [key: string]: any;
}

interface PlatformData {
  provider: string;
  providerAccountId: string;
  accessToken: string;
  username: string;
  email: string;
  image: string;
}

const LinkSocialAccount = () => {
  const { data: session } = useSession(); // Get the logged-in user's session
  const [user, setUser] = useState<User | null>(null); // Initialize user state
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setUser(session?.user as User); // Set the session user to the state
    }
  }, [session]);

  const handleLinkGoogle = async () => {
    if (!user) return;

    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      // Link the user's Google account with the currently authenticated user
      const result = await firebase.auth().currentUser!.linkWithPopup(provider);
      const linkedUser = result.user;

      console.log("Google account linked successfully:", linkedUser);

      // After successful linking, prepare the platform data
      const platformData: PlatformData = {
        provider: "google",
        providerAccountId: linkedUser?.uid ?? "", // Google Account ID
        accessToken:
          (result.credential as firebase.auth.OAuthCredential)?.accessToken ??
          "", // OAuth access token
        username: linkedUser?.displayName!,
        email: linkedUser?.email!,
        image: linkedUser?.photoURL!,
      };

      // Send platform data to your backend for storing it in your DB
      await fetch("/api/auth/connectSocialAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(platformData),
      });

      // Redirect to profile page or show a success message
      router.push("/profile");
    } catch (error: any) {
      console.error("Error linking Google account:", error.message);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}</h2>
          <button onClick={handleLinkGoogle}>Link Google Account</button>
        </div>
      ) : (
        <div>Please log in first to link a social account.</div>
      )}
    </div>
  );
};

export default LinkSocialAccount;
