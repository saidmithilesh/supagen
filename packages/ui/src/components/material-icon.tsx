import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@supagen/ui/lib/utils";

export type MaterialIconProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> & {
  name: string;
  size?: number;
};

function MaterialIcon({
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
  className,
  name,
  size = 20,
  style,
  ...props
}: MaterialIconProps) {
  return (
    <span
      aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
      aria-label={ariaLabel}
      className={cn("material-symbols-outlined", className)}
      style={{ fontSize: size, ...style }}
      {...props}
    >
      {name}
    </span>
  );
}

export { MaterialIcon };
