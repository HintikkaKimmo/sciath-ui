"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrustCenter } from "@/services/trust-center";
import { queryKeys } from "@/lib/api";

export function useTrustCenter(slug: string) {
  return useQuery({
    queryKey: queryKeys.trustCenter.detail(slug),
    queryFn: () => getTrustCenter(slug),
    enabled: !!slug,
  });
}
