import { ThemeToggle } from "@/components/Theme-Toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MaintainLogo } from "../MaintainLogo";

const AppHeader = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <Link
            href={'/'}
          >  <span className="text-xl font-semibold">
              EventSphere
            </span>
          </Link>


        </div> */}
        <MaintainLogo linkHref="/" />
        {/* <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#benefits"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Benefits
          </Link>
          <Link
            href="#for-businesses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            For Businesses
          </Link>
        </nav> */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
