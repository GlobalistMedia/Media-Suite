"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { User, Camera, Shield, CreditCard, Crown } from "lucide-react";

export function AccountSettings() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Corp",
    timezone: "UTC-5",
    avatar: "",
  });

  const [subscription] = useState({
    plan: "Premium",
    status: "active",
    nextBilling: "2024-04-15",
    amount: "$29/month",
  });

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6">
          Account Settings
        </h2>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-lg">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, company: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={profile.timezone}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, timezone: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button>Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </Card>

      {/* Subscription Info */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6">Subscription</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{subscription.plan} Plan</h3>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next billing: {subscription.nextBilling} •{" "}
                  {subscription.amount}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
              <Button size="sm">Upgrade</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">∞</p>
              <p className="text-sm font-medium">Posts per month</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">10</p>
              <p className="text-sm font-medium">Connected accounts</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">✓</p>
              <p className="text-sm font-medium">AI features</p>
            </div>
          </div>
        </div>
      </Card>
      {/* Security Settings */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-muted-foreground">
                Last changed 3 months ago
              </p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          {/* <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Login Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Manage your active sessions
              </p>
            </div>
            <Button variant="outline">View Sessions</Button>
          </div> */}
        </div>
      </Card>
    </div>
  );
}
