---
title: "The Negated Flag Problem: How OpenSSL's PACKAGECONFIG Breaks Every Scanner"
description: "no-ssl3 doesn't mean 'no SSL3 support.' It means SSL3 is compiled OUT. Every vulnerability scanner we tested gets this wrong."
date: "2026-04-08"
author: "Kimmo Hintikka"
tags: ["yocto", "packageconfig", "openssl", "false-positives", "build-system"]
draft: true
---

`no-ssl3` doesn't mean "no SSL3 support." It means SSL3 is compiled OUT. Every vulnerability scanner we tested gets this wrong.

## PACKAGECONFIG in 30 seconds

Yocto's PACKAGECONFIG system lets recipes define optional features that can be enabled or disabled at build time. The concept is simple: if a flag is present in `PACKAGECONFIG`, the feature is compiled in.

```bitbake
PACKAGECONFIG = "ssl zlib"
PACKAGECONFIG[ssl] = "--with-ssl,--without-ssl,openssl"
```

Flag present → feature enabled → related CVEs apply. Flag absent → feature compiled out → related CVEs suppressed. Clean and predictable.

Until you hit OpenSSL.

## The OpenSSL surprise

OpenSSL uses an inverted naming convention. Instead of flags that enable features, it has flags that disable them:

- `no-ssl3` — compiles OUT SSLv3 support
- `no-tls1` — compiles OUT TLSv1.0
- `no-weak-ssl-ciphers` — removes SWEET32-vulnerable ciphers
- `no-comp` — disables compression (prevents CRIME attack)

The presence of `no-ssl3` in PACKAGECONFIG means SSLv3 is **disabled**. The absence means SSLv3 **might be enabled**. This is the exact opposite of every other recipe in the Yocto ecosystem.

## Why scanners get this wrong

A naive scanner sees `PACKAGECONFIG` contains `no-ssl3` and thinks "SSL3 is a feature, it's enabled, CVEs apply." Wrong. The flag's presence means the feature is gone.

A slightly smarter scanner ignores PACKAGECONFIG entirely and just checks the OpenSSL version. This catches version-specific CVEs but misses the build-time suppressions. POODLE (CVE-2014-3566) doesn't apply if SSL3 was compiled out at build time, regardless of the OpenSSL version.

## Three effect types

We modeled three distinct PACKAGECONFIG semantics:

**`feature_enabled`** — the standard case. Flag present = feature compiled in = CVEs apply.

**`feature_disabled`** — inverted. Flag absent = feature might be present = CVEs apply. Used for optional dependencies like GStreamer's `soup` flag (libsoup HTTP source).

**`negated_flag`** — the OpenSSL pattern. Flag present = feature compiled OUT = CVEs suppressed. The flag name itself describes what's removed.

```python
if effect == "negated_flag":
    # Flag present means feature is DISABLED (compiled out)
    # So if the flag IS in PACKAGECONFIG, suppress the CVEs
    if flag_name in active_flags:
        suppressions.extend(cve_ids)
elif effect == "feature_disabled":
    # Flag absent means feature is NOT compiled in
    if flag_name not in active_flags:
        suppressions.extend(cve_ids)
```

## The numbers

Once we handled negated flags correctly, our CVE suppression maps expanded from 71 to 104 CVE IDs across OpenSSL alone. A 46% increase in suppressable CVEs that every other tool misses.

Some specific examples:

| Flag | Effect | CVEs Suppressed |
|------|--------|-----------------|
| `no-ssl3` | POODLE and SSLv3 vulnerabilities | 3 |
| `no-weak-ssl-ciphers` | SWEET32, Logjam, FREAK | 3 |
| `no-comp` | CRIME attack | 1 |

## The GStreamer bonus

While mapping PACKAGECONFIG flags, we found an even more surprising case. GStreamer's `soup` flag adds HTTP source support via libsoup. Disabling it suppresses 18 CVEs, none of which are in GStreamer's own code. They're in libsoup, a transitive dependency.

These include RCE (stack overflow), CRLF injection, HTTP smuggling, use-after-free, and auth bypass vulnerabilities. All irrelevant if your embedded device doesn't stream HTTP media.

## The full map

We've mapped 9 recipes so far:

| Recipe | Flags Mapped | CVE IDs |
|--------|-------------|---------|
| openssl | 8 | 104 |
| curl | 6 | 12 |
| busybox | 4 | 8 |
| systemd | 5 | 15 |
| gstreamer1.0 | 3 | 22 |
| dbus | 2 | 4 |
| ffmpeg | 4 | 18 |
| bluez5 | 3 | 9 |
| wpa-supplicant | 3 | 7 |

Each map is a JSON file that pairs PACKAGECONFIG flags with the CVE IDs they affect, the effect type, and a justification explaining why the suppression is valid.

## What this means for CRA compliance

Under the EU Cyber Resilience Act, manufacturers must demonstrate ongoing vulnerability management. Reporting CVEs that don't apply to your build configuration wastes analyst time and dilutes the signal. Worse, it makes your compliance reports unreliable, because auditors can't tell which CVEs are real.

Build-time configuration is a first-class security boundary. Your scanner needs to understand it.
