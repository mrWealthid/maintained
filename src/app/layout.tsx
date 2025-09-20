import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./global.css";
import Provider from "@/utils/Provider";
import { Toaster } from "react-hot-toast";
import { Toaster as Toasts } from "@/components/ui/sonner";
import { ThemeProvider } from "./shared/contexts/ThemeProvider";

const raleway = Raleway({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maintainly",
  description: "Automate Maintenance Today!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const theme = await getThemeFromCookie();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${raleway.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            position="bottom-center"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: { duration: 3000 },
              error: { duration: 4000 },
              style: {
                fontSize: "14px",
                maxWidth: "500px",
                padding: "16px 24px",
              },
            }}
          />

          <Toasts />

          <Provider>{children}</Provider>
        </ThemeProvider>
        {/* <Toaster
          position="bottom-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 4000 },
            style: {
              fontSize: "14px",
              maxWidth: "500px",
              padding: "16px 24px",
            },
          }}
        /> */}
      </body>
    </html>
  );
}
