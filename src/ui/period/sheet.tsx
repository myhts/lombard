import type { ReactNode } from "react";

// plain: a sheet lying on the counter. aged: an older document, in the aged paper colour with aged edges. lifted: a
// sheet picked up, by its deeper shadow.
const variants = {
  plain: "bg-paper shadow-resting",
  aged: "bg-paper-aged inset-shadow-aged-edges shadow-resting",
  lifted: "bg-paper shadow-lifted",
};

// A sheet of paper, the base for most period pieces (docs/ui/THEME.md, "Period pieces"). `className` is for what the
// caller decides: the sheet's width, padding and place.
export function Sheet({
  variant = "plain",
  className = "",
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`texture-laid rounded-paper text-ink ${variants[variant]} ${className}`}>{children}</div>;
}
