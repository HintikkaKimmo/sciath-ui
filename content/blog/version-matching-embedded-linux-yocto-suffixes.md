---
title: "5.15.32+gitAUTOINC+4b81a347a8 Is Not a Version Number (But Your Scanner Needs to Parse It)"
description: "CycloneDX says the component version is 5.15.32+gitAUTOINC+4b81a347a8. NVD says the fix is in 5.15.33. Are you affected? The answer depends on 380 lines of version comparison code."
date: "2026-04-11"
author: "Kimmo Hintikka"
tags: ["yocto", "cyclonedx", "version-matching", "sbom", "embedded-linux"]
draft: true
---

CycloneDX says the component version is `5.15.32+gitAUTOINC+4b81a347a8`. NVD says the fix is in `5.15.33`. Are you affected?

The answer seems obvious. `5.15.32 < 5.15.33`, so yes, you're affected. But getting to that answer reliably across every package in an embedded Linux SBOM is a 380-line version comparison engine with ecosystem-aware dispatch, Yocto suffix stripping, and a zero-false-negative fallback for every edge case.

## The SBOM version problem

When Yocto generates an SBOM (CycloneDX or SPDX), component versions come from the recipe. These are not clean semver strings. They're Yocto recipe versions:

```
5.15.32+gitAUTOINC+4b81a347a8    # kernel with git autorev
1.1.1k-r0                         # OpenSSL with Yocto revision
2.36.1+git                         # glibc tracking git
0.0+git                            # package with no upstream version
3.1.1+really3.0.9-r0              # Debian epoch encoding in Yocto
```

NVD publishes affected version ranges using CPE version strings: `5.15.33`, `1.1.1l`, `2.37`. Clean, upstream versions. No Yocto suffixes, no git hashes, no `-r0` revisions.

The gap between "what Yocto calls this version" and "what NVD calls this version" is where false positives and false negatives live.

## Suffix stripping

The first step is normalizing Yocto versions to upstream equivalents:

```python
# 5.15.32+gitAUTOINC+4b81a347a8 → 5.15.32
# 1.1.1k-r0 → 1.1.1k
# 2.36.1+git → 2.36.1
```

Sounds simple. But `+deb11u1` is a Debian revision that matters (it indicates a security backport). And `0.0+git` means there is no upstream version at all. The package was added to the build at an arbitrary git commit.

When we can't parse a version, we don't skip it. We assume affected. A false positive (flagging a CVE that doesn't apply) costs 10 minutes of review. A false negative (missing a real CVE because we couldn't parse the version) invalidates a compliance filing.

## Ecosystem-aware comparison

Even after stripping suffixes, "compare two versions" is not one algorithm. It's at least three:

**Debian-style** (`apt_pkg`): Handles epochs, upstream versions, and Debian revisions. Knows that `1:2.0` is greater than `3.0` (the epoch wins). Required for any package that originated in Debian.

**PEP 440 / Semver** (`packaging`): For Python packages, npm, crates.io, Go modules. Handles pre-release versions, build metadata, and version specifiers.

**Loose comparison** (our fallback): Splits on dots and hyphens, compares segments numerically then lexicographically. Handles OpenSSL's letter suffixes (`1.1.1k < 1.1.1l`) and four-part kernel versions (`5.15.32.1`).

The dispatcher selects the engine based on the package ecosystem:

```python
def _select_engine(ecosystem, range_type):
    if eco in ("debian", "deb") or range_type == "ECOSYSTEM":
        return "apt_pkg" if _HAS_APT_PKG else "loose"
    if range_type == "SEMVER" or eco in ("pypi", "npm", "crates.io", "go"):
        return "packaging"
    return "loose"
```

For Yocto and "generic" ecosystems (which is most embedded Linux), we fall through to the loose comparator. It handles the majority of cases. When it can't parse a segment, we assume affected.

## The dual-path matching problem

Version comparison is only half the story. First you need to find which CVEs apply to which components. Two independent matching paths run for every component:

**CPE path**: The component's CPE string (if the SBOM includes one) is matched against NVD's `cpe_list` on enriched CVEs. This is the standard approach. It works well for components where NVD has good CPE data.

**Package advisory path**: The component's name is matched against package advisories from Debian, kernel.org, OSV, and PyPI. This catches CVEs where NVD hasn't assigned a CPE yet, or where the CPE is wrong.

Both paths always run. Results are unioned. If one path misses a CVE, the other catches it. Advisory-only CVEs (where NVD hasn't published a record yet) get stub records so they appear in triage rather than being silently dropped.

## Why CycloneDX pedigree matters

CycloneDX 1.4+ includes a `pedigree.patches` field where the SBOM generator can record which patches have been applied to a component. In Yocto, this can capture backported security fixes that don't change the version number.

OpenSSL 1.1.1k with a backported fix for CVE-2024-XXXX is still version `1.1.1k`. Without pedigree data, the version comparison says "affected." With it, the scanner sees "patched" and can suppress with evidence.

We extract pedigree patches from CycloneDX SBOMs and feed them into the patch detection filter layer. This is one of the few cases where the SBOM format directly affects scanning accuracy.

## The 0.0+git problem

Some Yocto recipes have no upstream version. The recipe tracks a git commit directly:

```bitbake
PV = "0.0+git${SRCPV}"
SRCREV = "a1b2c3d4..."
```

The CycloneDX SBOM reports version `0.0+git`. NVD says the CVE is fixed in version `2.1.0`. Is `0.0+git` less than `2.1.0`?

It might be. Or the git commit might be from a development branch that's ahead of `2.1.0`. We can't know without cloning the repo and checking the commit date against the release timeline.

Our answer: assume affected. Flag it for manual review. The analyst can check the actual commit and make a determination. This is the zero-false-negative principle at work: when the data is ambiguous, err toward flagging.

## What we learned

Version comparison for embedded Linux is not a library call. It's a domain-specific engineering problem that requires understanding how Yocto encodes versions, how NVD publishes version ranges, and how the gap between them creates both false positives and false negatives.

The version comparator is 380 lines. It handles 90% of cases automatically. The other 10% get flagged for human review, which is the right answer when compliance is on the line.
