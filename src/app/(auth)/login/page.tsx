"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_URL ?? "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? "";

const providers = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
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
        <path
          d="m1.224 9.245-.169.52a1.163 1.163 0 0 0 .423 1.3L12 22.245 1.224 9.245z"
          fill="#FCA326"
        />
        <path
          d="M1.224 9.245h6.552L5.21 1.97a.58.58 0 0 0-1.103 0L1.224 9.245z"
          fill="#E24329"
        />
        <path d="M12 22.245 16.224 9.245h6.552L12 22.245z" fill="#FC6D26" />
        <path
          d="m22.776 9.245.169.52a1.163 1.163 0 0 1-.423 1.3L12 22.245l10.776-13z"
          fill="#FCA326"
        />
        <path
          d="M22.776 9.245h-6.552L18.79 1.97a.58.58 0 0 1 1.103 0l2.883 7.275z"
          fill="#E24329"
        />
      </svg>
    ),
  },
];

/**
 * Build the OAuth login URL.
 *
 * Flow: browser → allauth login → allauth redirects to LOGIN_REDIRECT_URL
 * → Django constructs DOT /o/authorize/ URL → DOT redirects to /auth/callback
 *
 * For now, we go directly to allauth and let Django's LOGIN_REDIRECT_URL
 * handle the DOT authorize step. The `next` param is passed through
 * allauth → DOT state → callback.
 */
function buildLoginUrl(providerId: string, next: string): string {
  // allauth will handle OAuth, then redirect to LOGIN_REDIRECT_URL
  // which should be a Django view that initiates the DOT authorize flow
  const callbackNext = encodeURIComponent(next);
  return `${DJANGO_URL}/accounts/${providerId}/login/?process=login&next=${encodeURIComponent(`/auth/ui-bridge/?next=${callbackNext}`)}`;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error === "missing_code" && "Login failed: missing authorization code."}
          {error === "exchange_failed" && "Login failed: could not complete authentication."}
          {!["missing_code", "exchange_failed"].includes(error) && "Login failed. Please try again."}
        </div>
      )}
      {providers.map((provider) => (
        <a
          key={provider.id}
          href={buildLoginUrl(provider.id, next)}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {provider.icon}
          Continue with {provider.name}
        </a>
      ))}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-normal tracking-tight">Sciath</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            CRA compliance automation for embedded Linux
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-card"
                />
              ))}
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to Sciath&apos;s Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
