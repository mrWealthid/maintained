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
  Sparkles,
  Wrench,
  Building2,
  Activity,
  BarChart3,
  MessagesSquare,
  Bell,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Route,
  Inbox,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/Theme-Toggle";
import { ProperlyLogo } from "@/shared/components/ProperlyLogo";
import { Reveal, CountUp } from "@/components/landing/motion";

const features = [
  {
    icon: Sparkles,
    title: "AI Triage",
    desc: "Every request is read, categorized, prioritized, and routed the moment it lands — no manual sorting.",
    tone: "primary" as const,
    points: [
      "Auto category & priority",
      "Detects missing information",
      "Drafts tenant replies",
    ],
  },
  {
    icon: Route,
    title: "Smart Dispatch",
    desc: "Matches each ticket to the right technician by skill, location, and workload, then tracks the job to done.",
    tone: "resolved" as const,
    points: [
      "Skill-based assignment",
      "Live job tracking",
      "Re-triage in one click",
    ],
  },
  {
    icon: MessagesSquare,
    title: "Tenant Requests",
    desc: "A 24/7 portal where tenants report issues and follow progress, with built-in chat on every ticket.",
    tone: "accent" as const,
    points: [
      "Submit from any device",
      "Real-time status",
      "In-thread messaging",
    ],
  },
  {
    icon: Building2,
    title: "Multi-Property",
    desc: "Manage every property, unit, and tenant from one workspace — with roles and access for your whole team.",
    tone: "primary" as const,
    points: ["Properties & units", "Tenant directory", "Role-based access"],
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    desc: "Status changes, assignments, and notes stream live to everyone involved, with instant notifications.",
    tone: "resolved" as const,
    points: ["Live activity feed", "Email & push alerts", "Full audit trail"],
  },
  {
    icon: BarChart3,
    title: "Insights",
    desc: "See resolution times, technician workload, and recurring issues so you can fix problems before they repeat.",
    tone: "accent" as const,
    points: ["Resolution metrics", "Workload balance", "Recurring-issue trends"],
  },
];

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  resolved: "bg-status-resolved/15 text-status-resolved",
  accent: "bg-accent text-accent-foreground",
};

const steps = [
  {
    step: "01",
    icon: Inbox,
    title: "Request comes in",
    desc: "A tenant reports an issue through the portal or by email — no app install required.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI triages it",
    desc: "Properly categorizes the request, sets priority, and flags anything that's missing.",
  },
  {
    step: "03",
    icon: Route,
    title: "Auto-dispatch",
    desc: "The right technician is matched and assigned, with full context attached.",
  },
  {
    step: "04",
    icon: CheckCircle2,
    title: "Tracked to resolved",
    desc: "Everyone follows live status until the ticket is closed and logged.",
  },
];

const stats = [
  { to: 60, suffix: "%", label: "Faster first response", desc: "vs. manual triage" },
  { to: 12000, suffix: "+", label: "Tickets triaged", desc: "Across active workspaces" },
  { to: 4000, suffix: "+", label: "Units managed", desc: "In one platform" },
  { to: 98, suffix: "%", label: "Resolution rate", desc: "Closed within SLA" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col max-h-screen overflow-y-auto bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <ProperlyLogo linkHref="/" size="md" />

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#results"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Results
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — animated gradient blobs + grid texture */}
        <section className="relative w-full overflow-hidden py-20 md:py-28 lg:py-36">
          <div className="pointer-events-none absolute inset-0 bg-grid [mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-60" />
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-blob" />
          <div className="pointer-events-none absolute top-10 -right-16 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-blob [animation-delay:4s]" />

          <div className="container relative mx-auto px-4">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <Reveal>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-primary"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  AI-Powered Maintenance Triage
                </Badge>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  Maintenance, resolved the
                  <span className="block bg-linear-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent animate-gradient">
                    moment it&apos;s reported
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  Properly reads every maintenance request, triages it with AI,
                  and dispatches the right technician automatically — so nothing
                  slips through the cracks across all your properties.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                  <Button asChild size="lg" className="h-12 px-8 font-medium group">
                    <Link href="auth/signup">
                      Start free trial
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8">
                    <Link href="#how-it-works">See how it works</Link>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-status-open text-status-open"
                        />
                      ))}
                    </div>
                    <span className="font-medium">Loved by property teams</span>
                  </div>
                  <div className="hidden sm:block h-4 w-px bg-border" />
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Built for multi-tenant teams</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Features — muted band with dotted texture */}
        <section
          id="features"
          className="relative w-full border-y border-border bg-muted/30 py-20 md:py-28"
        >
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
          <div className="container relative mx-auto px-4">
            <Reveal className="flex flex-col items-center space-y-4 text-center mb-16">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary"
              >
                Everything in one workspace
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                From request to resolved — handled
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Properly replaces spreadsheets, inboxes, and group chats with one
                system built for property maintenance.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={(i % 3) * 0.08}>
                    <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${toneClasses[f.tone]}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-xl font-semibold text-foreground">
                            {f.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground leading-relaxed">
                          {f.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {f.points.map((p) => (
                            <li key={p} className="flex items-center space-x-3">
                              <CheckCircle2 className="h-4 w-4 text-status-resolved shrink-0" />
                              <span className="text-sm text-muted-foreground">
                                {p}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works — plain background with connecting line */}
        <section id="how-it-works" className="w-full py-20 md:py-28">
          <div className="container mx-auto px-4">
            <Reveal className="flex flex-col items-center space-y-4 text-center mb-16">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary"
              >
                How it works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Four steps, zero busywork
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                From the moment a tenant hits submit, Properly does the
                coordinating for you.
              </p>
            </Reveal>

            <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              <div className="pointer-events-none absolute left-0 right-0 top-7 hidden lg:block h-px bg-linear-to-r from-transparent via-border to-transparent" />
              {steps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal
                    key={item.step}
                    delay={index * 0.1}
                    className="relative flex flex-col items-center text-center space-y-4"
                  >
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-background text-primary shadow-sm animate-floaty" style={{ animationDelay: `${index * 0.4}s` }}>
                      <Icon className="h-6 w-6" />
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[15rem]">
                      {item.desc}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results — bold animated gradient band */}
        <section
          id="results"
          className="relative w-full overflow-hidden bg-linear-to-br from-primary via-primary to-violet-600 py-20 md:py-28 text-primary-foreground animate-gradient"
        >
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob [animation-delay:5s]" />
          <div className="container relative mx-auto px-4">
            <Reveal className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Results teams feel in week one
              </h2>
            </Reveal>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <Reveal
                  key={stat.label}
                  delay={index * 0.08}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  <div className="text-4xl font-bold sm:text-5xl">
                    <CountUp to={stat.to} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <p className="text-xs text-primary-foreground/70">{stat.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — contained gradient card with blobs */}
        <section className="w-full py-20 md:py-28">
          <div className="container mx-auto px-4">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 sm:px-12 md:py-20">
                <div className="pointer-events-none absolute inset-0 bg-grid mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-50" />
                <div className="pointer-events-none absolute -top-16 -right-10 h-60 w-60 rounded-full bg-primary/20 blur-3xl animate-blob" />
                <div className="relative flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Put maintenance on autopilot
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Start triaging requests with AI today. Set up your workspace
                      in minutes — no credit card required.
                    </p>
                  </div>
                  <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Input
                      type="email"
                      placeholder="Enter your work email"
                      className="flex-1 h-12"
                    />
                    <Button asChild className="h-12 px-8 font-medium">
                      <Link href="auth/signup">Get started</Link>
                    </Button>
                  </form>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-status-resolved" /> Free trial
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-status-resolved" /> Setup in
                      minutes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-status-resolved" /> Cancel
                      anytime
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <ProperlyLogo linkHref="/" size="md" disableLink />
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI maintenance triage and dispatch for property teams — every
                request handled, from report to resolved.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Product
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-foreground transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#results" className="hover:text-foreground transition-colors">
                    Results
                  </Link>
                </li>
                <li>
                  <Link href="auth/signup" className="hover:text-foreground transition-colors">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Get in touch
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@properly.app</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4" />
                  <span>Support 24/7</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Properly. All rights reserved.
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
