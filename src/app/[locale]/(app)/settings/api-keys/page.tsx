"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Check, Copy, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiKeys, useGenerateApiKey, useRevokeApiKey } from "@/hooks/use-api-keys";

const AVAILABLE_SCOPES = [
  "read:projects", "write:projects",
  "read:scans", "write:scans",
  "read:assessments", "write:assessments",
  "read:reports", "write:reports",
  "read:policies", "write:policies",
];

export default function ApiKeysPage() {
  const { data: keys, isLoading } = useApiKeys();
  const generateKey = useGenerateApiKey();
  const revokeKey = useRevokeApiKey();

  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read:projects", "read:scans"]);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!keyName.trim() || selectedScopes.length === 0) return;
    generateKey.mutate(
      { name: keyName.trim(), scopes: selectedScopes },
      {
        onSuccess: (data) => {
          setNewRawKey(data.raw_key);
          setKeyName("");
          setShowForm(false);
        },
      }
    );
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const copyKey = () => {
    if (!newRawKey) return;
    navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif">API Keys</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keys for CLI and CI/CD integrations. Keep them secret.
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => {
            setShowForm(!showForm);
            setNewRawKey(null);
          }}
        >
          <Plus className="h-3 w-3" /> Generate Key
        </Button>
      </div>

      {/* New key banner */}
      {newRawKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 space-y-2">
          <p className="text-xs font-medium text-emerald-800">
            Key created. Copy it now — you won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-white px-2 py-1 rounded border">
              {newRawKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={copyKey}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {/* Generate form */}
      {showForm && (
        <div className="bg-card border rounded-md p-3 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. CI Pipeline"
              className="w-full mt-0.5 px-2 py-1 text-sm border rounded bg-background"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Scopes</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {AVAILABLE_SCOPES.map((scope) => (
                <button
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    selectedScopes.includes(scope)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleGenerate}
              disabled={generateKey.isPending || !keyName.trim() || selectedScopes.length === 0}
            >
              {generateKey.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Generate"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
          {generateKey.isError && (
            <p className="text-xs text-red-600">
              {(generateKey.error as Error).message}
            </p>
          )}
        </div>
      )}

      {/* Keys table */}
      <div className="bg-card border rounded-md overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : keys?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
            <Inbox className="size-8 text-primary/30" />
            <p>No API keys yet. Generate one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground bg-secondary/30">
                <th className="text-left font-medium px-3 py-2">Name</th>
                <th className="text-left font-medium px-3 py-2">Key</th>
                <th className="text-left font-medium px-3 py-2">Scopes</th>
                <th className="text-left font-medium px-3 py-2">Created</th>
                <th className="text-left font-medium px-3 py-2">Last Used</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {keys?.filter(k => k.is_active).map((k) => (
                <tr
                  key={k.id}
                  className="border-b last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-3 py-2 font-medium">{k.name}</td>
                  <td className="px-3 py-2">
                    <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {k.prefix}...
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[9px] font-mono"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(k.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {k.last_used_at
                      ? new Date(k.last_used_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      className="p-1 text-muted-foreground hover:text-red-600"
                      onClick={() => revokeKey.mutate(k.id)}
                      title="Revoke key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
