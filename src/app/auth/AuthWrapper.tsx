import { ThemeToggle } from "@/components/Theme-Toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BetweenVerticalStart,
  Building2,
  Cog,
  Cuboid,
  GalleryVerticalEnd,
  Settings,
  SquareStack,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="w-full border-b sticky top-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              ApartmentHub
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full  space-y-6">{children}</div>
      </div>
    </div>
  );
}
