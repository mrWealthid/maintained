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
    <div className="flex flex-col max-h-screen overflow-y-auto bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              ApartmentHub
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#solutions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#support"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href={"auth/login"}>Sign In</Link>
            </Button>
            <Button asChild size="sm">
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
                  className="border-primary/30 bg-primary/5 text-primary"
                >
                  Enterprise Housing Solutions
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  Streamline Your
                  <span className="block text-primary">
                    Housing Operations
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  Complete property management platform for modern businesses.
                  Handle applications, maintenance requests, and property
                  listings with enterprise-grade efficiency.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button size="lg" className="h-12 px-8 font-medium">
                  Schedule Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8">
                  View Pricing
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-status-open text-status-open"
                      />
                    ))}
                  </div>
                  <span className="font-medium">4.9/5 Customer Rating</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
          className="w-full py-16 md:py-24 bg-muted/40"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center space-y-4 text-center mb-16">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary"
              >
                Comprehensive Solutions
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything your business needs
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Integrated platform designed for property managers, real estate
                professionals, and housing organizations.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      Property Search
                    </CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    Advanced search capabilities with intelligent filtering,
                    virtual tours, and automated matching algorithms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Multi-criteria filtering system
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        360° virtual property tours
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        AI-powered recommendations
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-resolved/15">
                      <Wrench className="h-5 w-5 text-status-resolved" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      Maintenance Management
                    </CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    Streamlined maintenance workflow with automated routing,
                    real-time tracking, and vendor management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        24/7 request submission portal
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Real-time status updates
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Certified service provider network
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Home className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      Property Listings
                    </CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    Professional listing management with automated screening,
                    digital contracts, and performance analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Professional photography service
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Automated tenant screening
                      </span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-status-resolved shrink-0" />
                      <span className="text-sm text-muted-foreground">
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
                className="border-primary/30 bg-primary/5 text-primary"
              >
                Implementation Process
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get started in four simple steps
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-primary font-semibold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 bg-muted/40">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {stat.label}
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Ready to transform your housing operations?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join industry leaders who trust ApartmentHub to streamline
                  their property management processes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your business email"
                  className="flex-1 h-12"
                />
                <Button className="h-12 px-8 font-medium">
                  Request Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free 30-day trial • No setup fees • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">
                  ApartmentHub
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enterprise-grade housing management platform trusted by property
                professionals worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Solutions
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Property Search
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Maintenance
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Listings
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © 2024 ApartmentHub. All rights reserved.
            </p>
            <nav className="flex gap-6 mt-4 sm:mt-0">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
