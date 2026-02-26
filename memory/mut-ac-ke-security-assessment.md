# mut.ac.ke Security Snapshot (quick scan)
Date: 2026-02-26 (UTC)

## Summary
Quick scan attempts encountered connectivity/timeouts and missing tooling on host. Results below are partial and should be re-run from a network with confirmed reachability and required tools installed.

## Current Tech Stack
- whatweb: **timeout** when opening https://www.mut.ac.ke/ (no fingerprint obtained).
- curl -I: **hung/no response** (no headers retrieved).

## Open Ports
- nmap -sV -sC -p 80,443,8080,8443 41.204.160.15
  - Result: **Host seems down / no response to ping**. Suggest re-run with `-Pn` if ICMP blocked.
  - No open ports confirmed.

## Exposed Directories
- gobuster: **command not found** (tool missing). No directory enumeration results.

## DNS Records
- dnsrecon: **command not found** (tool missing). No DNS records captured.

## Risk Summary (<=1 page)
- The target appears unreachable from this environment (HTTPS timeout, no ICMP response). If the host blocks ICMP, port scans should be repeated with `-Pn` to avoid false negatives.
- Missing tooling (gobuster, dnsrecon) prevented directory and DNS enumeration; these are key for attack surface discovery.
- Recommendation: Re-run scans with required tools installed and from a network that can reliably reach the target. Consider adding TCP connect checks (e.g., `nc -vz 41.204.160.15 80 443`) and trying `curl -I --connect-timeout 10` to confirm HTTPS reachability.
