"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Zap,
  Mail,
  Calendar,
  BarChart3,
  Globe,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Newsletters",
    href: "/newsletters",
    description: "Create and manage newsletters with 95/5 revenue share",
    icon: Mail,
  },
  {
    title: "Social Scheduling",
    href: "/social",
    description: "Plan and schedule posts across all platforms",
    icon: Calendar,
  },
  {
    title: "Analytics",
    href: "/analytics",
    description: "Track performance across all your channels",
    icon: BarChart3,
  },
  {
    title: "Content Hub",
    href: "/content",
    description: "Publish to Globalist.live and your own website",
    icon: Globe,
  },
  {
    title: "CRM & Contacts",
    href: "/contacts",
    description: "Manage subscribers and supporters",
    icon: Users,
  },
];

const solutions = [
  {
    title: "For Creators",
    href: "/creators",
    description: "Keep your earnings, grow your community",
  },
  {
    title: "For Agencies",
    href: "/agencies",
    description: "Manage multiple campaigns in one suite",
  },
  {
    title: "For Journalists",
    href: "/journalists",
    description: "Go beyond newsletters with multimedia stories",
  },
  {
    title: "For Enterprises",
    href: "/enterprises",
    description: "Share impact stories across channels",
  },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mediasuite
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[500px] gap-3 p-4 md:w-[600px] lg:grid-cols-2">
                  {features.map((feature) => (
                    <NavigationMenuLink key={feature.title} asChild>
                      <Link
                        href={feature.href}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center space-x-2">
                          <feature.icon className="h-4 w-4" />
                          <div className="text-sm font-medium leading-none">
                            {feature.title}
                          </div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {feature.description}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[400px] gap-3 p-4">
                  {solutions.map((solution) => (
                    <NavigationMenuLink key={solution.title} asChild>
                      <Link
                        href={solution.href}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {solution.title}
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {solution.description}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/pricing"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/about"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Features
                  </h3>
                  {features.map((feature) => (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <feature.icon className="h-4 w-4" />
                      <span>{feature.title}</span>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Solutions
                  </h3>
                  {solutions.map((solution) => (
                    <Link
                      key={solution.title}
                      href={solution.href}
                      className="block p-2 rounded-md hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      {solution.title}
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <Link
                    href="/pricing"
                    className="block p-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/about"
                    className="block p-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/signin" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="justify-start">
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
