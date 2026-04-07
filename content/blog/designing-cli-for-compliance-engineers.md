---
title: "Designing a CLI for Compliance Engineers (Who Aren't DevOps People)"
description: "Our users are firmware security analysts, not SREs. They don't pipe to jq. They don't read man pages. Here's how we designed a vulnerability scanning CLI that works for them."
date: "2026-04-12"
author: "Kimmo Hintikka"
tags: ["cli", "developer-experience", "design", "compliance"]
draft: true
---

Our users are firmware security analysts, not SREs. They don't pipe to `jq`. They don't read man pages. Here's how we designed a vulnerability scanning CLI that works for them.

## The user isn't who you think

Most CLI design advice assumes the user lives in the terminal. They know `grep`, `awk`, and `xargs`. They have opinions about shells.

Our users are different. They work in compliance. They use Excel. They know enough terminal to run `bitbake core-image-minimal` and `scp` files to a server. The CLI is a tool they use because the web UI can't run inside a Yocto build environment.

This changes every design decision.

## Three output modes, one architecture

Every command supports three output formats, and the choice isn't cosmetic. It maps to who's reading the output:

**`--format table`** (default): Rich terminal tables with colors, box drawing, progress spinners. This is for the human sitting at the terminal running a scan and waiting. They want to see "is my firmware compliant?" without parsing anything.

**`--format json`**: Machine-readable output for CI/CD pipelines and LLM agents. No color codes, no progress bars, no interactive elements. Composable with `jq` or consumed directly by the MCP server (which exposes the same data to Claude, Cursor, and other AI editors).

**`--format quiet`**: Exit code only. For CI gates where you just need pass/fail. `--severity-threshold critical --fail-on-kev` means "fail the build if any critical CVE or CISA KEV entry exists." Zero output, meaningful return code.

The implementation uses a single `OutputFormatter` class. Every command calls the same rendering functions. Adding a new output format means adding one method to the formatter, not touching every command.

## The waterfall: making suppression legible

When a scan reduces 387 CVEs to 178, the analyst's first question is "what happened to the other 209?" Not "how many were filtered" but "why were they filtered and should I trust that?"

The waterfall visualization answers this in the terminal:

```
Raw CVEs from SBOM:         387
After build-time filter:    364  (-23 not deployed to device)
After Kconfig suppression:  222  (-142 kernel features disabled)
After PACKAGECONFIG:        198  (-24 optional features off)
After patch detection:      178  (-20 already backported)
═══════════════════════════════
ACTION REQUIRED:            178
```

Each layer has a human-readable name. The numbers add up. The analyst can see exactly where the reduction happened and decide whether to trust it.

The JSON output includes the same waterfall as structured data, so CI systems can track noise reduction over time.

## The --explain flag

The waterfall shows aggregate numbers. `--explain` shows per-CVE reasoning:

```
FILTER REASONING:
CVE-2024-1234  openssl  Kconfig     CONFIG_CRYPTO_USER=n    confidence: very_high
CVE-2024-5678  curl     PKGCONFIG   no-ftp compiled out      confidence: high
CVE-2024-9012  kernel   BSP_VERSION fixed in 6.1.75          confidence: medium

WHY THESE CVEs MATTER:
CVE-2026-0001  openssl  9.8  CRITICAL  IN CISA KEV  EPSS: 0.87
  → Component present, version affected, no patch evidence, no config mitigation
CVE-2026-0002  curl     7.5  HIGH      EPSS: 0.42
  → Version range match, no backport detected in pedigree
```

The "why these matter" section is sorted by KEV status first, then CVSS. The analyst sees the most urgent items at the top. Each survivor gets a narrative explaining why it passed all filters and needs attention.

## Device flow auth

The CLI needs to authenticate against the Sciath API. But our users are often SSH'd into a build server without a browser. Standard OAuth redirect flow doesn't work.

We use device flow authentication:

1. CLI requests a device code from the API
2. CLI displays: "Go to sciath.io/device and enter code: A1B2-C3D4"
3. User opens their laptop browser, enters the code, approves
4. CLI polls until authorization completes
5. API key is stored locally for subsequent use

The polling uses a spinner with a 15-minute timeout. If the user takes too long (left the terminal, forgot about it), the session expires with a clear message rather than hanging.

Token refresh happens automatically. The user authenticates once. After that, `sciath scan run` just works until the refresh token expires (30 days).

## Auto-discovery vs explicit flags

The original CLI required explicit paths for every artifact:

```bash
sciath scan run firmware.cdx.json --kconfig .config --dtb board.dtb --version v3.2
```

This is fine for CI pipelines where paths are known. It's terrible for an analyst running a scan for the first time.

Auto-discovery probes the build directory for conventional artifact locations:

```bash
sciath scan run --auto-discover --build-dir build/
```

It detects the build system (Yocto, Buildroot, Debian, OpenWrt), finds the SBOM, locates the kernel `.config`, discovers DTB files, and collects PACKAGECONFIG flags. If something is ambiguous (multiple SBOMs found), it warns and uses the first match.

The tradeoff: auto-discovery is less predictable than explicit flags. But for our users, "it found everything automatically" beats "I need to know where Yocto puts the SBOM" every time.

Power users can override: `--sbom`, `--kconfig`, `--dtb` always take precedence over auto-discovery.

## CI exit codes

The hardest design decision: when should `sciath scan` return a non-zero exit code?

Option 1: any CVE found = fail. Too noisy. Every scan fails.
Option 2: only critical CVEs = fail. Misses high-severity issues.
Option 3: configurable threshold. The answer.

```bash
# Fail on critical or high severity
sciath scan run --severity-threshold high --format quiet

# Fail only if CISA KEV entries exist (known exploited)
sciath scan run --fail-on-kev --format quiet

# Both: fail on high+ OR any KEV
sciath scan run --severity-threshold high --fail-on-kev --format quiet
```

The exit code is computed independently of the output format. `--format quiet` suppresses all output but still returns the right code. CI systems check `$?`, not stdout.

## The MCP server: CLI for AI

The newest user of the CLI isn't a human at all. It's an LLM agent running in Claude Code or Cursor.

`sciath mcp` launches the CLI as an MCP (Model Context Protocol) server with stdio transport. It exposes the same operations: scan SBOM, check status, list findings, get compliance status. The AI editor can invoke scans and interpret results within the developer's workflow.

The implementation reuses the same API client and authentication as the CLI commands. No separate backend. Same error handling. The AI gets the same data quality as the human.

## What we learned

CLI design for non-technical users is counterintuitive. You'd think they want fewer options. They actually want fewer decisions. Auto-discovery, sensible defaults, and output that explains itself. The power features (JSON output, exit codes, severity thresholds) exist for the CI pipeline, not the human.

The biggest impact was the `--explain` flag. Before it existed, analysts would run a scan, see the numbers, and not trust them. After, they could see exactly why each CVE was suppressed or flagged. Trust came from transparency, not from fewer results.
