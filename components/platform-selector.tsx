"use client";

import { Button } from "@/components/ui/button";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Facebook,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";

interface PlatformSelectorProps {
  selectedPlatforms: number[];
  onPlatformToggle: (platformId: number) => void;
}

const platforms = [
  { id: 1, name: "X", icon: Twitter },
  { id: 2, name: "LinkedIn", icon: Linkedin },
  { id: 3, name: "Instagram", icon: Instagram },
  { id: 4, name: "YouTube", icon: Youtube },
  { id: 5, name: "Facebook", icon: Facebook },
  { id: 6, name: "Personal", icon: Globe },
];

export function PlatformSelector({
  selectedPlatforms,
  onPlatformToggle,
}: PlatformSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium">Platforms</label>
      <div className="flex gap-2 mt-2 flex-wrap">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);

          return (
            <Button
              key={platform.id}
              variant="outline"
              size="sm"
              className={`flex-1 sm:flex-none ${
                isSelected ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => onPlatformToggle(platform.id)}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{platform.name}</span>
              <span className="sm:hidden">{platform.name.slice(0, 3)}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
