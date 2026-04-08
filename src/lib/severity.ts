export const statusStyle: Record<string, string> = {
  affected: "bg-red-100 text-red-700 border-red-200",
  not_affected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  fixed: "bg-blue-100 text-blue-700 border-blue-200",
  under_investigation: "bg-amber-100 text-amber-700 border-amber-200",
};

export function getCvssColor(cvss: number) {
  if (cvss >= 9) return "text-red-600";
  if (cvss >= 7) return "text-orange-600";
  if (cvss >= 4) return "text-amber-600";
  return "text-blue-600";
}

export function getSeverityBar(cvss: number) {
  if (cvss >= 9) return "bg-red-500";
  if (cvss >= 7) return "bg-orange-500";
  if (cvss >= 4) return "bg-amber-400";
  return "bg-blue-500";
}

export const reportStatusStyle: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
  generating: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};
