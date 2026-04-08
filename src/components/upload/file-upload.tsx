"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACCEPTED_FORMATS = [".json", ".xml", ".spdx", ".cdx", ".config", ".dtb"]
const MAX_SIZE_MB = 50

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error"

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  multiple?: boolean
  onFileContent?: (content: string, filename: string) => void
}

export function FileUpload({ onUpload, multiple = true, onFileContent }: FileUploadProps) {
  const [state, setState] = useState<UploadState>("idle")
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const detectFormat = (name: string) => {
    if (name.endsWith(".spdx.json") || name.endsWith(".spdx")) return "SPDX SBOM"
    if (name.includes("cdx") || name.includes("cyclonedx") || name.includes("bom.json")) return "CycloneDX SBOM"
    if (name === ".config" || name.endsWith("kernel.config")) return "Kernel Config"
    if (name.endsWith(".dtb")) return "Device Tree"
    if (name.includes("busybox")) return "BusyBox Config"
    if (name.endsWith(".json")) return "JSON"
    if (name.endsWith(".xml")) return "XML"
    return "Unknown"
  }

  const handleFiles = useCallback((incoming: FileList | File[]) => {
    const arr = multiple ? Array.from(incoming) : [Array.from(incoming)[0]]
    const oversized = arr.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (oversized) {
      setError(`${oversized.name} exceeds ${MAX_SIZE_MB}MB limit`)
      setState("error")
      return
    }
    setFiles(arr)
    setState("uploading")
    setError("")

    if (onFileContent) {
      const file = arr[0]
      const reader = new FileReader()
      reader.onload = () => {
        setProgress(100)
        setState("success")
        onFileContent(reader.result as string, file.name)
        onUpload?.(arr)
      }
      reader.onerror = () => {
        setError(`Failed to read ${file.name}`)
        setState("error")
      }
      reader.onprogress = (e) => {
        if (e.lengthComputable) setProgress((e.loaded / e.total) * 100)
      }
      reader.readAsText(file)
    } else {
      // Simulate upload progress
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 30
        if (p >= 100) {
          p = 100
          clearInterval(interval)
          setState("success")
          onUpload?.(arr)
        }
        setProgress(Math.min(p, 100))
      }, 200)
    }
  }, [onUpload, onFileContent, multiple])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState("idle")
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const reset = () => {
    setFiles([])
    setState("idle")
    setProgress(0)
    setError("")
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setState("dragging") }}
        onDragLeave={() => setState("idle")}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          state === "dragging"
            ? "border-primary bg-primary/5"
            : state === "error"
              ? "border-red-300 bg-red-50"
              : "border-border hover:border-primary/50"
        }`}
      >
        {state === "idle" || state === "dragging" ? (
          <>
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              Drop build artifacts here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              SBOM (CycloneDX, SPDX), kernel .config, device tree, BusyBox config
            </p>
            <label className="mt-3 inline-block">
              <input
                type="file"
                multiple={multiple}
                accept={ACCEPTED_FORMATS.join(",")}
                className="sr-only"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <span className="cursor-pointer rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80 transition-colors">
                Browse files
              </span>
            </label>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Max {MAX_SIZE_MB}MB per file · {ACCEPTED_FORMATS.join(", ")}
            </p>
          </>
        ) : state === "uploading" ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploading {files.length} file{files.length > 1 ? "s" : ""}...</p>
            <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        ) : state === "success" ? (
          <div className="space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700">Upload complete</p>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={reset}>
              Upload more
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-red-700">{error}</p>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={reset}>
              Try again
            </Button>
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && state !== "idle" && (
        <div className="space-y-1">
          {files.map((f) => (
            <div key={f.name} className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium flex-1 truncate">{f.name}</span>
              <span className="text-[10px] text-muted-foreground">{detectFormat(f.name)}</span>
              <span className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(0)}KB</span>
              {state !== "uploading" && (
                <button onClick={reset} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
