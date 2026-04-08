"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { apiFetch, ApiError, buildQuery } from "@/lib/api";

type InviteData = {
  id: string;
  team_name: string;
  inviter_email: string;
  role: string;
};

type InviteState =
  | { status: "loading" }
  | { status: "valid"; invite: InviteData }
  | { status: "accepting" }
  | { status: "accepted" }
  | { status: "expired" }
  | { status: "invalid" }
  | { status: "error"; message: string };

function InviteAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("invite");
  const tc = useTranslations("common");
  const token = searchParams.get("token");

  const [state, setState] = useState<InviteState>(
    token ? { status: "loading" } : { status: "invalid" }
  );
  const [invite, setInvite] = useState<InviteData | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function validate() {
      try {
        const data = await apiFetch<InviteData>(
          `/core/v1/team/invites/validate/${buildQuery({ token: token ?? undefined })}`
        );
        if (!cancelled) {
          setInvite(data);
          setState({ status: "valid", invite: data });
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          if (err.status === 404 || err.status === 410) {
            setState({ status: "expired" });
          } else {
            setState({ status: "error", message: err.message });
          }
        } else {
          setState({ status: "invalid" });
        }
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = useCallback(async () => {
    if (!invite || !token) return;

    setState({ status: "accepting" });

    try {
      await apiFetch(`/core/v1/team/invites/${invite.id}/accept/`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setState({ status: "accepted" });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setState({ status: "error", message: err.message });
      } else {
        setState({ status: "error", message: "An unexpected error occurred" });
      }
    }
  }, [invite, token, router]);

  return (
    <div className="w-full max-w-md bg-card border rounded-lg p-6 space-y-4">
      {/* Loading */}
      {state.status === "loading" && (
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      )}

      {/* Valid — ready to accept */}
      {state.status === "valid" && (
        <div className="text-center space-y-4">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold font-serif">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { team: state.invite.team_name })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("invitedBy", { email: state.invite.inviter_email })}
          </p>
          <div>
            <Badge variant="secondary">
              {t("role", { role: state.invite.role })}
            </Badge>
          </div>
          <Button className="w-full" onClick={handleAccept}>
            {t("accept")}
          </Button>
        </div>
      )}

      {/* Accepting */}
      {state.status === "accepting" && (
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">{t("accepting")}</p>
        </div>
      )}

      {/* Accepted */}
      {state.status === "accepted" && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <p className="text-sm text-muted-foreground">{t("accepted")}</p>
        </div>
      )}

      {/* Expired */}
      {state.status === "expired" && (
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <p className="text-sm text-muted-foreground">{t("expired")}</p>
        </div>
      )}

      {/* Invalid */}
      {state.status === "invalid" && (
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <p className="text-sm text-muted-foreground">{t("invalid")}</p>
        </div>
      )}

      {/* Error with retry */}
      {state.status === "error" && (
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <p className="text-sm text-muted-foreground">{t("errorGeneric")}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            {tc("retry")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-card border rounded-lg p-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          </div>
        }
      >
        <InviteAcceptContent />
      </Suspense>
    </div>
  );
}
