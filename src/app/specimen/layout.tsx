import type { ReactNode } from "react";

// Every route under /specimen is static. The specimen sheet reads the theme stylesheet from disk when it renders, and
// only the build is sure to run in the repo root. With "error", the build fails and names the route if a page here
// reads a request-time value. A route here declares no `dynamic` or `revalidate` of its own: `revalidate = 0` would
// make it render per request and the build would still pass (docs/ui/THEME.md, rule 12).
export const dynamic = "error";

export default function SpecimenLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
