"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "analyst" | "viewer";
  customerId: string;
}

const DEV_USER: User = {
  id: "dev",
  email: "dev@sciath.io",
  name: "Dev User",
  role: "admin",
  customerId: "dev-customer",
};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ user: User }>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        // In development, return a mock user so app pages are usable
        if (process.env.NODE_ENV === "development") {
          return { user: DEV_USER };
        }
        throw new Error("Not authenticated");
      }
      return res.json();
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    logout: logout.mutate,
  };
}
