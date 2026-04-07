"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Shield, Layers, Filter, FileCheck } from "lucide-react";

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_URL ?? "http://localhost:8000";

const providers = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: "gitlab",
    name: "GitLab",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="m12 22.245-4.224-13h8.448L12 22.245z" fill="#E24329" />
        <path d="M12 22.245 7.776 9.245H1.224L12 22.245z" fill="#FC6D26" />
        <path d="m1.224 9.245-.169.52a1.163 1.163 0 0 0 .423 1.3L12 22.245 1.224 9.245z" fill="#FCA326" />
        <path d="M1.224 9.245h6.552L5.21 1.97a.58.58 0 0 0-1.103 0L1.224 9.245z" fill="#E24329" />
        <path d="M12 22.245 16.224 9.245h6.552L12 22.245z" fill="#FC6D26" />
        <path d="m22.776 9.245.169.52a1.163 1.163 0 0 1-.423 1.3L12 22.245l10.776-13z" fill="#FCA326" />
        <path d="M22.776 9.245h-6.552L18.79 1.97a.58.58 0 0 1 1.103 0l2.883 7.275z" fill="#E24329" />
      </svg>
    ),
  },
];

function buildLoginUrl(
  providerId: string,
  next: string,
  codeChallenge: string
): string {
  const bridgeParams = new URLSearchParams({
    next,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  const nextParam = `/auth/ui-bridge/?${bridgeParams.toString()}`;
  return `${DJANGO_URL}/accounts/${providerId}/login/?process=login&next=${encodeURIComponent(nextParam)}`;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState<string | null>(null);
  const t = useTranslations("login");

  async function handleLogin(providerId: string) {
    setLoading(providerId);
    try {
      const res = await fetch("/api/auth/pkce", { method: "POST" });
      if (!res.ok) {
        setLoading(null);
        return;
      }
      const { code_challenge } = await res.json();
      window.location.assign(buildLoginUrl(providerId, next, code_challenge));
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error === "missing_code" && t("errorMissingCode")}
          {error === "exchange_failed" && t("errorExchangeFailed")}
          {!["missing_code", "exchange_failed"].includes(error) && t("errorGeneric")}
        </div>
      )}
      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => handleLogin(provider.id)}
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          {provider.icon}
          {loading === provider.id ? t("redirecting") : t("continueWith", { provider: provider.name })}
        </button>
      ))}
    </div>
  );
}

const highlightKeys = [
  { icon: Shield, key: "craCompliance" },
  { icon: Layers, key: "hardwareFiltering" },
  { icon: Filter, key: "falsePositiveReduction" },
  { icon: FileCheck, key: "oneClickReports" },
] as const;

export default function LoginPage() {
  const t = useTranslations("login");
  const tc = useTranslations("common");

  return (
    <div className="flex min-h-screen">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full border border-primary-foreground/30" />
          <div className="absolute bottom-1/3 right-10 w-60 h-60 rounded-full border border-primary-foreground/20" />
          <div className="absolute top-2/3 left-1/3 w-40 h-40 rounded-full border border-primary-foreground/20" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20 font-semibold text-lg">
                S
              </div>
              <span className="font-serif text-2xl">{tc("sciath")}</span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-serif text-4xl leading-tight">
              {t("headline")}
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-md leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="space-y-3 pt-4">
              {highlightKeys.map((h) => (
                <div key={h.key} className="flex items-center gap-3">
                  <h.icon className="h-4 w-4 text-primary-foreground/50 shrink-0" />
                  <span className="text-sm text-primary-foreground/80">{t(h.key)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-primary-foreground/40">
            {t("euCompliant")}
          </p>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
                S
              </div>
            </div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">{tc("sciath")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("cta")}
            </p>
          </div>

          <div className="hidden lg:block text-center">
            <h1 className="text-2xl font-normal tracking-tight font-serif">{t("signIn")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("chooseProvider")}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-card" />
                ))}
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <p className="text-center text-xs text-muted-foreground">
            {t("termsNotice")}
          </p>
        </div>
      </div>
    </div>
  );
}
