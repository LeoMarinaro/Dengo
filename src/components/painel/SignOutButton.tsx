"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { secondaryButtonClass } from "./ui";

export function SignOutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className={secondaryButtonClass}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace(redirectTo);
        router.refresh();
      }}
    >
      Sair
    </button>
  );
}
