import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Search,
  Wrench,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Building2,
  Shield,
  Clock,
  TrendingUp,
  Award,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/Theme-Toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col max-h-screen overflow-y-auto bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              ApartmentHub
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#solutions"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#support"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Support
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <Link href={"auth/login"}>Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href={"auth/signup"}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <div className="space-y-6">
                <Badge
                  variant="outline"
                  className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                >
                  Enterprise Housing Solutions
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Streamline Your
                  <span className="block text-blue-600">
                    Housing Operations
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl">
                  Complete property management platform for modern businesses.
                  Handle applications, maintenance requests, and property
                  listings with enterprise-grade efficiency.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Schedule Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent"
                >
                  View Pricing
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="font-medium">4.9/5 Customer Rating</span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">50,000+ Active Users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section
          id="solutions"
          className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center space-y-4 text-center mb-16">
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
              >
                Comprehensive Solutions
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything your business needs
              </h2>
              <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Integrated platform designed for property managers, real estate
                professionals, and housing organizations.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Property Search
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Advanced search capabilities with intelligent filtering,
                    virtual tours, and automated matching algorithms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Multi-criteria filtering system
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        360° virtual property tours
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        AI-powered recommendations
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                      <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Maintenance Management
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Streamlined maintenance workflow with automated routing,
                    real-time tracking, and vendor management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        24/7 request submission portal
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Real-time status updates
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Certified service provider network
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Property Listings
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Professional listing management with automated screening,
                    digital contracts, and performance analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Professional photography service
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Automated tenant screening
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Digital lease management
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center space-y-4 text-center mb-16">
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
              >
                Implementation Process
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Get started in four simple steps
              </h2>
              <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Our streamlined onboarding process gets your team up and running
                quickly.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Consultation",
                  desc: "Schedule a demo and discuss your specific requirements with our team.",
                },
                {
                  step: "02",
                  title: "Setup",
                  desc: "We configure the platform according to your business needs and workflows.",
                },
                {
                  step: "03",
                  title: "Training",
                  desc: "Comprehensive training sessions for your team to ensure smooth adoption.",
                },
                {
                  step: "04",
                  title: "Launch",
                  desc: "Go live with full support and ongoing assistance from our experts.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-600 text-blue-600 font-semibold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              {[
                {
                  icon: <Users className="h-5 w-5" />,
                  number: "50,000+",
                  label: "Active Users",
                  desc: "Property managers and tenants",
                },
                {
                  icon: <Home className="h-5 w-5" />,
                  number: "10,000+",
                  label: "Properties Managed",
                  desc: "Across multiple markets",
                },
                {
                  icon: <Award className="h-5 w-5" />,
                  number: "98%",
                  label: "Customer Satisfaction",
                  desc: "Based on user surveys",
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  number: "40%",
                  label: "Efficiency Increase",
                  desc: "Average time savings",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-3 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.label}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Ready to transform your housing operations?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Join industry leaders who trust ApartmentHub to streamline
                  their property management processes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your business email"
                  className="flex-1 h-12 border-gray-300 dark:border-gray-600"
                />
                <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Request Demo
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Free 30-day trial • No setup fees • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ApartmentHub
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Enterprise-grade housing management platform trusted by property
                professionals worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Solutions
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Property Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Maintenance
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Listings
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-APARTMENT</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>sales@apartmenthub.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 ApartmentHub. All rights reserved.
            </p>
            <nav className="flex gap-6 mt-4 sm:mt-0">
              <Link
                href="#"
                className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Security
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
