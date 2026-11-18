import type { ReactNode } from "react";

// The specimen sheet reads the theme stylesheet from disk when it renders, and only the build is sure to run in the
// repo root. With "error", the build fails and names the route if /specimen or a page under it reads a request-time
// value. Two things get past it, so a route here avoids both (docs/ui/THEME.md, rule 12): a `dynamic` or `revalidate`
// of its own (`revalidate = 0` renders per request and the build still passes), and a dynamic segment without
// `generateStaticParams` and `dynamicParams = false` (the page renders on the server at its first request).
// Not `ensureStatic`: it needs `cacheComponents: true` in next.config.ts, and spec #12 allows no configuration change.
export const dynamic = "error";

export default function SpecimenLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
