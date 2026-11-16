import { Fleuron } from "./fleuron";

// A line drawn as SVG and stretched to the width it is given: one hairline, or a printer's double rule, thick over thin.
function Line({ double = false, className = "" }: { double?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={double ? "0 0 1 6" : "0 0 1 1"}
      preserveAspectRatio="none"
      fill="currentColor"
      className={`block w-full ${double ? "h-1.5" : "h-px"} ${className}`}
    >
      {double ? (
        <>
          <rect width="1" height="3" />
          <rect width="1" height="1" y="5" />
        </>
      ) : (
        <rect width="1" height="1" />
      )}
    </svg>
  );
}

// A printer's rule: thin, double, or thin with a flower at its middle. Drawn in the colour of the text around it, and an
// ornament, so hidden from assistive technology. `className` is for the space around it.
export function Rule({
  variant = "thin",
  className = "",
}: {
  variant?: "thin" | "double" | "flower";
  className?: string;
}) {
  if (variant !== "flower") return <Line double={variant === "double"} className={className} />;

  return (
    <div aria-hidden="true" className={`flex items-center gap-3 ${className}`}>
      <Line className="min-w-0 flex-1" />
      <Fleuron />
      <Line className="min-w-0 flex-1" />
    </div>
  );
}
