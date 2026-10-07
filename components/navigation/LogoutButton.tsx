"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const LogoutButton = ({ compactOnLarge = true }: { compactOnLarge?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: ROUTES.SIGN_IN });
  };

  return (
    <Button
      disabled={isLoading}
      onClick={handleLogout}
      className="base-medium w-fit !bg-transparent px-4 py-3"
    >
      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-dark300_light900" />
      ) : (
        <Image src="/icons/account.svg" alt="logout" width={20} height={20} className="invert-colors lg:hidden" />
      )}
      <span className={`text-dark300_light900 ${compactOnLarge ? "max-lg:hidden" : ""}`}>
        {isLoading ? "Logging out..." : "Logout"}
      </span>
    </Button>
  );
};

export default LogoutButton;
