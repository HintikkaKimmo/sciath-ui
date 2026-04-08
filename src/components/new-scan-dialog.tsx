"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/upload/file-upload";
import { useCreateScan, useTriggerAnalysis } from "@/hooks/use-scans";
import { listPolicies } from "@/services/policies";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";

const SBOM_FORMATS = [
  { value: "", label: "sbomFormatAuto" },
  { value: "cyclonedx", label: "CycloneDX (JSON)" },
  { value: "spdx", label: "SPDX (JSON)" },
  { value: "yocto_manifest", label: "Yocto Manifest" },
  { value: "buildroot_legal", label: "Buildroot legal-info" },
  { value: "emba", label: "EMBA" },
  { value: "csv", label: "CSV" },
] as const;

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 50 * 1024 * 1024) {
      reject(new Error("File exceeds 50 MB limit"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

interface NewScanDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewScanDialog({
  projectId,
  open,
  onOpenChange,
}: NewScanDialogProps) {
  const t = useTranslations("newScan");
  const router = useRouter();
  const createScan = useCreateScan();
  const triggerAnalysis = useTriggerAnalysis();

  // Form state
  const [versionLabel, setVersionLabel] = useState("");
  const [sbomContent, setSbomContent] = useState<string | null>(null);
  const [sbomFilename, setSbomFilename] = useState("");
  const [sbomFormat, setSbomFormat] = useState("");
  const [kconfigContent, setKconfigContent] = useState<string | null>(null);
  const [dtbContent, setDtbContent] = useState<string | null>(null);
  const [filterPolicyId, setFilterPolicyId] = useState("");
  const [filterContent, setFilterContent] = useState<string | null>(null);
  const [analyseAfterCreate, setAnalyseAfterCreate] = useState(true);
  const [carryForward, setCarryForward] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch policies for dropdown
  const { data: policiesData } = useQuery({
    queryKey: queryKeys.policies.list(),
    queryFn: () => listPolicies(),
    enabled: open,
  });

  const policies = policiesData?.items ?? [];

  const handleSbomContent = useCallback(
    (content: string, filename: string) => {
      setSbomContent(content);
      setSbomFilename(filename);
      setError(null);
    },
    []
  );

  async function handleSubmit() {
    if (!versionLabel.trim()) {
      setError(t("versionRequired"));
      return;
    }
    if (!sbomContent) {
      setError(t("sbomRequired"));
      return;
    }

    setError(null);

    try {
      const scan = await createScan.mutateAsync({
        project_id: projectId,
        version_label: versionLabel.trim(),
        sbom_raw: sbomContent,
        status: "draft",
        sbom_format: (sbomFormat || "") as "" | "cyclonedx" | "spdx" | "yocto_manifest" | "buildroot_legal" | "emba" | "csv",
        kconfig_raw: kconfigContent || "",
        dtb_raw: dtbContent || "",
        depgraph_raw: "",
        custom_filter_raw: filterContent || "",
        ...(filterPolicyId &&
          filterPolicyId !== "upload" && {
            policy_name: filterPolicyId,
          }),
        yocto_machine: "",
        yocto_distro: "",
        kernel_version: "",
      });

      if (analyseAfterCreate) {
        await triggerAnalysis.mutateAsync({
          scanId: scan.id,
          carryForward,
        });
      }

      onOpenChange(false);
      router.push(`/products/${projectId}/scans/${scan.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create scan"
      );
    }
  }

  const isSubmitting = createScan.isPending || triggerAnalysis.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* D1: SBOM drop zone first */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">
              {t("sbomFile")} <span className="text-red-500">*</span>
            </label>
            <FileUpload
              multiple={false}
              onFileContent={handleSbomContent}
            />
            {sbomFilename && (
              <div className="mt-2 flex items-center gap-2">
                <Select
                  value={sbomFormat}
                  onValueChange={(v) => setSbomFormat(v ?? "")}
                >
                  <SelectTrigger className="w-[180px] h-7 text-xs">
                    <SelectValue placeholder={t("sbomFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SBOM_FORMATS.map((f) => (
                      <SelectItem key={f.value} value={f.value || "auto"}>
                        {f.value === "" ? t(f.label) : f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* D1: Version label second */}
          <div>
            <label
              htmlFor="version-label"
              className="text-xs font-medium mb-1.5 block"
            >
              {t("versionLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="version-label"
              placeholder={t("versionPlaceholder")}
              className="h-8 text-sm"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              aria-required="true"
            />
          </div>

          {/* D1: Advanced Options collapsed */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {t("advancedOptions")}
          </button>

          {showAdvanced && (
            <div className="space-y-3 pl-4 border-l-2 border-border">
              {/* Kconfig */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  {t("kconfigFile")}
                </label>
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  {t("kconfigOptional")}
                </p>
                <input
                  type="file"
                  accept=".config"
                  className="h-8 text-sm file:mr-2 file:text-xs file:border-0 file:bg-secondary file:px-2 file:py-1 file:rounded"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      try {
                        const content = await readFileAsText(
                          e.target.files[0]
                        );
                        setKconfigContent(content);
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Failed to read file"
                        );
                      }
                    }
                  }}
                />
              </div>

              {/* DTB */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  {t("dtbFile")}
                </label>
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  {t("dtbOptional")}
                </p>
                <input
                  type="file"
                  accept=".dts,.dtb"
                  className="h-8 text-sm file:mr-2 file:text-xs file:border-0 file:bg-secondary file:px-2 file:py-1 file:rounded"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      try {
                        const content = await readFileAsText(
                          e.target.files[0]
                        );
                        setDtbContent(content);
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Failed to read file"
                        );
                      }
                    }
                  }}
                />
              </div>

              {/* Filter policy */}
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  {t("filterPolicy")}
                </label>
                <Select
                  value={filterPolicyId}
                  onValueChange={(v) => setFilterPolicyId(v ?? "")}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder={t("filterPolicyNone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("filterPolicyNone")}
                    </SelectItem>
                    {policies.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="upload">
                      {t("filterPolicyUpload")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterPolicyId === "upload" && (
                <div>
                  <label className="text-xs font-medium mb-1.5 block">
                    {t("filterFile")}
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    className="h-8 text-sm file:mr-2 file:text-xs file:border-0 file:bg-secondary file:px-2 file:py-1 file:rounded"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        try {
                          const content = await readFileAsText(
                            e.target.files[0]
                          );
                          setFilterContent(content);
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Failed to read file"
                          );
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* D1: Analysis Settings in callout box */}
          <div className="bg-secondary/50 border rounded-md p-3 space-y-2">
            <p className="text-xs font-medium">{t("analysisSettings")}</p>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={analyseAfterCreate}
                onChange={(e) => setAnalyseAfterCreate(e.target.checked)}
                className="rounded"
              />
              {t("analyseAfterCreate")}
            </label>
            {analyseAfterCreate && (
              <label className="flex items-center gap-2 text-xs cursor-pointer pl-5">
                <input
                  type="checkbox"
                  checked={carryForward}
                  onChange={(e) => setCarryForward(e.target.checked)}
                  className="rounded"
                />
                {t("carryForward")}
              </label>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                {t("creating")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
