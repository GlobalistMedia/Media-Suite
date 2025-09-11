"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Mail,
  Calendar,
  BarChart3,
  Globe,
  Users,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  Instagram,
} from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Integrations", href: "/integrations" },
      { name: "API", href: "/api" },
      { name: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { name: "For Creators", href: "/creators" },
      { name: "For Agencies", href: "/agencies" },
      { name: "For Journalists", href: "/journalists" },
      { name: "For Enterprises", href: "/enterprises" },
      { name: "For Nonprofits", href: "/nonprofits" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Blog", href: "/blog" },
      { name: "Community", href: "/community" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Partners", href: "/partners" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/mediasuite", icon: Twitter },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/mediasuite",
    icon: Linkedin,
  },
  { name: "GitHub", href: "https://github.com/mediasuite", icon: Github },
  { name: "YouTube", href: "https://youtube.com/mediasuite", icon: Youtube },
  { name: "Facebook", href: "https://facebook.com/mediasuite", icon: Facebook },
  {
    name: "Instagram",
    href: "https://instagram.com/mediasuite",
    icon: Instagram,
  },
];

const features = [
  { name: "Newsletters", icon: Mail },
  { name: "Social Scheduling", icon: Calendar },
  { name: "Analytics", icon: BarChart3 },
  { name: "Content Hub", icon: Globe },
  { name: "CRM & Contacts", icon: Users },
];

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mediasuite
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The all-in-one platform for creators, marketers, and media teams.
              Unify your content strategy across newsletters, social media, and
              analytics.
            </p>

            {/* Feature highlights */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-3">Platform Features</h4>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                  >
                    <feature.icon className="h-3 w-3" />
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-muted-foreground">
              © 2024 Mediasuite. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8"
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
