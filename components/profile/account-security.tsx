"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { validatePassword, validatePasswordMatch } from "@/lib/utils";
import { ProfileData } from "@/hooks/useProfile";

interface AccountSecurityProps {
  className?: string;
  profileData?: ProfileData | null;
  onPasswordChanged?: () => void;
}

export function AccountSecurity({
  className,
  profileData,
  onPasswordChanged,
}: AccountSecurityProps) {
  const { toast } = useToast();

  // State variables
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isViewingSessions, setIsViewingSessions] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Helper function to format time difference
  const getTimeDifference = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    if (diffInMonths < 12)
      return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
    return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (
      !validatePasswordMatch(
        passwordForm.newPassword,
        passwordForm.confirmPassword
      )
    ) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    // Validate new password using shared validation
    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Too Weak",
        description: `Password must meet all requirements: ${passwordValidation.errors.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GLOBALIST_LIVE_URL}/auth/media-suite/change-password?id=${profileData?.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordDialog(false);

      // Notify parent component to refresh profile data
      if (onPasswordChanged) {
        onPasswordChanged();
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA setup
  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);

    try {
      // Simulate API call to generate QR code
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would make an API call here:
      // const response = await fetch('/api/enable-2fa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // })
      // const data = await response.json()
      // setQrCodeUrl(data.qrCodeUrl)

      // Simulate QR code URL
      setQrCodeUrl(
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/MediaSuite:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MediaSuite"
      );
      setShow2FADialog(true);

      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app.",
      });
    } catch (error) {
      toast({
        title: "2FA Setup Failed",
        description: "Failed to setup 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnabling2FA(false);
    }
  };

  // Handle 2FA verification
  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsEnabling2FA(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would make an API call here:
      // const response = await fetch('/api/verify-2fa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code: twoFactorCode })
      // })

      setIs2FAEnabled(true);
      setShow2FADialog(false);
      setTwoFactorCode("");
      setQrCodeUrl("");

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnabling2FA(false);
    }
  };

  // Handle 2FA disable
  const handleDisable2FA = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to disable two-factor authentication? This will make your account less secure."
    );
    if (!confirmed) return;

    setIsEnabling2FA(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would make an API call here:
      // await fetch('/api/disable-2fa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // })

      setIs2FAEnabled(false);

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error) {
      toast({
        title: "Disable Failed",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnabling2FA(false);
    }
  };

  // Handle view sessions
  const handleViewSessions = () => {
    setShowSessionsDialog(true);
  };

  // Mock session data
  const mockSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, NY",
      lastActive: "2 minutes ago",
      current: true,
      ip: "192.168.1.100",
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, NY",
      lastActive: "1 hour ago",
      current: false,
      ip: "192.168.1.101",
    },
    {
      id: 3,
      device: "Firefox on MacOS",
      location: "Los Angeles, CA",
      lastActive: "2 days ago",
      current: false,
      ip: "10.0.0.50",
    },
  ];

  // Handle terminate session
  const handleTerminateSession = async (sessionId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to terminate this session?"
    );
    if (!confirmed) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would make an API call here:
      // await fetch(`/api/sessions/${sessionId}`, {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' }
      // })

      toast({
        title: "Session Terminated",
        description: "The session has been terminated successfully.",
      });
    } catch (error) {
      toast({
        title: "Termination Failed",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Account Security Card */}
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Account Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                {profileData?.passwordChangedAt
                  ? `Last changed ${getTimeDifference(
                      new Date(profileData.passwordChangedAt)
                    )}`
                  : "Password not changed recently"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordDialog(true)}
              disabled={isChangingPassword}
            >
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled
                  ? "Enabled - Your account is protected"
                  : "Add an extra layer of security"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {is2FAEnabled && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Enabled
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                disabled={isEnabling2FA}
              >
                {isEnabling2FA
                  ? "Processing..."
                  : is2FAEnabled
                  ? "Disable 2FA"
                  : "Enable 2FA"}
              </Button>
            </div>
          </div>

          {/* <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Login Sessions</p>
              <p className="text-sm text-muted-foreground">
                Manage your active sessions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewSessions}
              disabled={isViewingSessions}
            >
              View Sessions
            </Button>
          </div> */}
        </div>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the
              verification code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            {qrCodeUrl && (
              <Image
                src={qrCodeUrl}
                alt="2FA QR Code"
                width={200}
                height={200}
                className="border rounded"
              />
            )}
            <div>
              <Label htmlFor="twoFactorCode">Verification Code</Label>
              <Input
                id="twoFactorCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className="mt-1 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FADialog(false);
                setTwoFactorCode("");
                setQrCodeUrl("");
              }}
              disabled={isEnabling2FA}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify2FA}
              disabled={isEnabling2FA || twoFactorCode.length !== 6}
            >
              {isEnabling2FA ? "Verifying..." : "Verify & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions Dialog */}
      <Dialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Manage your active login sessions across different devices.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {mockSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 border rounded-lg ${
                  session.current ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.location} • {session.ip}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {session.lastActive}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSessionsDialog(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to terminate all other sessions? You'll need to log in again on those devices."
                );
                if (confirmed) {
                  toast({
                    title: "Sessions Terminated",
                    description: "All other sessions have been terminated.",
                  });
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Terminate All Others
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
