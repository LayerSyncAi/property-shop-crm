"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Eye, LogOut } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "@/lib/errors";
import { animatedToast } from "@/components/ui/animated-toaster";

interface PlatformViewBannerProps {
  orgName?: string;
}

/**
 * Sticky strip shown to platform (LayerSync) staff while they have a client
 * organisation open. Everything on the page is read-only in this mode.
 */
export function PlatformViewBanner({ orgName }: PlatformViewBannerProps) {
  const router = useRouter();
  const exitViewOrg = useMutation(api.platform.exitViewOrg);
  const [leaving, setLeaving] = useState(false);

  const handleExit = async () => {
    setLeaving(true);
    try {
      await exitViewOrg();
      router.replace("/app/platform");
    } catch (error) {
      animatedToast.error("Could not exit organisation view", {
        description: getErrorMessage(error),
      });
      setLeaving(false);
    }
  };

  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900"
    >
      <span className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Platform view: <strong>{orgName ?? "organisation"}</strong> · read-only. Nothing you do here
          changes the client&apos;s data.
        </span>
      </span>
      <button
        type="button"
        onClick={handleExit}
        disabled={leaving}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-amber-400 bg-white/70 px-2.5 py-1 text-xs font-medium hover:bg-white disabled:opacity-60"
      >
        <LogOut className="h-3.5 w-3.5" />
        {leaving ? "Leaving..." : "Exit organisation"}
      </button>
    </div>
  );
}
