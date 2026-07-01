import type { CSSProperties } from "react";

import { MaterialIcon } from "@supagen/ui/components/material-icon";

export type MarketingIconName =
  | "account_tree"
  | "add"
  | "arrow_downward"
  | "arrow_forward"
  | "arrow_upward"
  | "attach_money"
  | "auto_awesome"
  | "bolt"
  | "cable"
  | "campaign"
  | "chat"
  | "check_circle"
  | "close"
  | "code"
  | "content_copy"
  | "dashboard"
  | "dark_mode"
  | "data_object"
  | "description"
  | "expand_more"
  | "extension"
  | "face"
  | "gavel"
  | "graphic_eq"
  | "groups"
  | "image"
  | "input"
  | "inventory_2"
  | "light_mode"
  | "monitoring"
  | "more_vert"
  | "movie"
  | "output"
  | "palette"
  | "payments"
  | "psychology"
  | "record_voice_over"
  | "rocket_launch"
  | "schedule"
  | "send"
  | "settings"
  | "smart_toy"
  | "support_agent"
  | "terminal"
  | "tune"
  | "videocam";

type MarketingIconProps = {
  className?: string;
  name: MarketingIconName;
  style?: CSSProperties;
};

export function MarketingIcon({ name, className, style }: MarketingIconProps) {
  return <MaterialIcon className={className} name={name} style={style} />;
}
