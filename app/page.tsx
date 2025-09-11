"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  BarChart3,
  Globe,
  Users,
  Zap,
  Star,
  ArrowRight,
  Play,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/20"></div>
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Modern workspace with multiple screens showing analytics and content creation"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative mx-auto max-w-7xl text-center z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            🚀 Now Available - All-in-One Media Suite
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent">
            One Platform.
            <br />
            Every Story, Every Channel.
          </h1>
          <p className="mx-auto max-w-3xl text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Globalist Media Suite combines newsletters, social scheduling,
            analytics, and CRM tools into a single ecosystem — built for
            creators, marketers, journalists, and enterprises.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6"
            >
              <Link href="/signup">Start for Free</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 group"
            >
              <Link href="/demo" className="flex items-center">
                <div className="relative mr-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
                </div>
                Watch Demo Video
              </Link>
            </Button>
          </div>

          {/* Dashboard Screenshot */}
          <div className="relative mx-auto max-w-6xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80"
                  alt="Mediasuite Dashboard showing analytics, content creation, and social media management"
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📧 Newsletters
                    </h3>
                    <p className="text-sm text-blue-700">95/5 revenue share</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                      📱 Social Posts
                    </h3>
                    <p className="text-sm text-green-700">
                      Multi-platform scheduling
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      📊 Analytics
                    </h3>
                    <p className="text-sm text-purple-700">Unified insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 px-4 bg-muted/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Tired of Juggling Too Many Tools?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Creators use Substack for newsletters, Hootsuite for scheduling,
              Mailchimp for campaigns, Google Analytics for data…
              <br />
              <span className="font-semibold text-primary">
                Mediasuite brings it all together in one place
              </span>{" "}
              — saving you time, money, and energy.
            </p>
          </div>

          {/* Problem Illustration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-red-200">
                <h3 className="font-semibold text-red-800 mb-4">
                  Current Chaos
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"
                      alt="Substack"
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-sm">Substack for newsletters</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"
                      alt="Hootsuite"
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-sm">Hootsuite for social</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"
                      alt="Mailchimp"
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-sm">Mailchimp for campaigns</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"
                      alt="Analytics"
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-sm">Google Analytics for data</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow-lg border-2 border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-4">
                  Mediasuite Solution
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"
                    alt="Mediasuite"
                    className="w-8 h-8 rounded"
                  />
                  <span className="text-sm font-semibold">
                    Everything in one platform
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded text-center">
                    📧 Newsletters
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    📱 Social
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    📊 Analytics
                  </div>
                  <div className="bg-white p-2 rounded text-center">🎯 CRM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features at a Glance */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Modular Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, publish, and grow — all in one
              powerful platform.
            </p>
          </div>

          {/* Feature Demo Video */}
          <div className="mb-16">
            <div className="relative mx-auto max-w-4xl">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-black/20"></div>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Mediasuite Platform Demo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-8 h-8 text-gray-800 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Newsletters</CardTitle>
                <CardDescription>
                  Publish with 95/5 revenue share
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Social Scheduling</CardTitle>
                <CardDescription>
                  Plan posts across platforms in one dashboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track performance across web, email, and social
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Content Hub</CardTitle>
                <CardDescription>
                  Publish to Globalist.live + your own website
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>CRM & Contacts</CardTitle>
                <CardDescription>
                  Manage subscribers and supporters with ease
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Advanced Features</CardTitle>
                <CardDescription>
                  AI-powered insights and automation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-4 bg-muted/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built for Modern Storytellers and Teams
            </h2>
            <div className="relative mx-auto max-w-4xl mb-8">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                alt="Diverse team collaborating on content creation and media strategy"
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <CardTitle>Independent Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep your earnings, grow your community
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <CardTitle>Digital Marketers & Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage multiple campaigns in one suite
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📰</span>
                </div>
                <CardTitle>Journalists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Go beyond newsletters with multimedia stories
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <CardTitle>NGOs & Enterprises</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your impact stories seamlessly across channels
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Choose Mediasuite Over Separate Tools?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">Mailchimp</th>
                  <th className="p-4 text-center font-semibold">Hootsuite</th>
                  <th className="p-4 text-center font-semibold">Substack</th>
                  <th className="p-4 text-center font-semibold">Mediasuite</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Newsletters</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Social Scheduling</td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Analytics</td>
                  <td className="p-4 text-center text-muted-foreground">
                    Limited
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    Basic
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    Limited
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    Advanced
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">CRM</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Website Publishing</td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 flex flex-col h-full">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <blockquote className="text-lg mb-6 flex-grow">
                &quot;Mediasuite has completely transformed how I manage my
                content. Having everything in one place saves me hours every
                week, and the 95/5 revenue split is incredible for creators like
                me.&quot;
              </blockquote>
              <div className="flex items-center mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
                  alt="Sarah Chen"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-muted-foreground">Independent Creator</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 flex flex-col h-full">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <blockquote className="text-lg mb-6 flex-grow">
                &quot;As a nonprofit, we needed a way to share our impact
                stories across multiple channels efficiently. Mediasuite&apos;s
                unified approach has helped us reach 3x more people with the
                same effort.&quot;
              </blockquote>
              <div className="flex items-center mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                  alt="Michael Rodriguez"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold">Michael Rodriguez</p>
                  <p className="text-muted-foreground">Nonprofit Director</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
        <div className="mx-auto max-w-6xl text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            The Future of Media & Marketing Is Unified.
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join thousands of creators, marketers, and organizations who have
            already made the switch to unified media management.
          </p>

          {/* Success Story Image */}
          <div className="relative mx-auto max-w-4xl mb-12">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Successful content creators and marketers celebrating their achievements with unified media tools"
              className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-lg font-semibold">Join 10,000+ Happy Users</p>
              <p className="text-sm opacity-90">
                Already growing with Mediasuite
              </p>
            </div>
          </div>

          {/* Funnel Graphic */}
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">✍️</span>
              </div>
              <p className="font-semibold">Create</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="font-semibold">Publish</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <p className="font-semibold">Analyze</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📈</span>
              </div>
              <p className="font-semibold">Grow</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
