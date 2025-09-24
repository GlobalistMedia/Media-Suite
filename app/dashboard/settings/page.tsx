"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PlatformIntegrations } from "@/components/settings/PlatformIntegrations";
import { EmailListManager } from "@/components/settings/EmailListManager";
// import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import {
  Bell,
  Link,
  Mail,
  Shield,
  Settings as SettingsIcon,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account preferences and configurations
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 h-auto p-1">
          {/* <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 py-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger> */}
          <TabsTrigger
            value="integrations"
            className="flex items-center gap-2 py-2"
          >
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 py-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 py-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          {/* <TabsTrigger value="privacy" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger> */}
        </TabsList>

        {/* <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent> */}

        <TabsContent value="integrations" className="space-y-6">
          <PlatformIntegrations />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailListManager />
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        {/* <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
