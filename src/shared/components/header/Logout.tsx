"use client";
import { useLogout } from "@/app/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Logout = () => {
  const router = useRouter();
  const { isLoading, logOut } = useLogout(router);
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start gap-2 px-2"
      disabled={isLoading}
      onClick={() => logOut()}
    >
      <LogOut className="size-4" />
      <span>Logout</span>
      {isLoading ? <Loader2 className="ml-auto size-4 animate-spin" /> : null}
    </Button>
  );
};

export default Logout;
