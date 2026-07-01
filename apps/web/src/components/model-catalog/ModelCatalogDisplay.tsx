import { MaterialIcon } from "@supagen/ui/components/material-icon";
import { cn } from "@supagen/ui/lib/utils";

import {
  formatModalityName,
  getModalityIconColorClassName,
  getModalityIconName,
  splitPriceValue,
} from "./ModelCatalogDisplay.utils";

export function PriceValue({ value }: { value: string | null }) {
  const priceParts = splitPriceValue(value);

  if (!priceParts) {
    return "—";
  }

  if (!priceParts.unit) {
    return priceParts.amount;
  }

  return (
    <span aria-label={value ?? undefined} className="inline-flex flex-col">
      <span>{priceParts.amount}</span>
      <span className="text-xs leading-4 text-muted-foreground">
        {priceParts.unit}
      </span>
    </span>
  );
}

export function ModalityIcons({
  label,
  modalities,
}: {
  label: string;
  modalities: string[];
}) {
  if (modalities.length === 0) {
    return (
      <span
        aria-label={`${label}: none listed`}
        className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground"
        title={`${label}: none listed`}
      >
        —
      </span>
    );
  }

  const accessibilityLabel = `${label}: ${modalities
    .map(formatModalityName)
    .join(", ")}`;

  return (
    <div
      aria-label={accessibilityLabel}
      className="flex min-h-7 items-center gap-1"
      title={accessibilityLabel}
    >
      {modalities.map((modality) => (
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background",
            getModalityIconColorClassName(modality),
          )}
          key={modality}
        >
          <MaterialIcon
            aria-hidden="true"
            name={getModalityIconName(modality)}
            size={18}
          />
        </span>
      ))}
    </div>
  );
}
