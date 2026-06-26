import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BadgeDollarSignIcon,
  BlocksIcon,
  BotIcon,
  BoxesIcon,
  BrainIcon,
  CableIcon,
  CircleCheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CircleDollarSignIcon,
  Code2Icon,
  CopyIcon,
  DatabaseIcon,
  FileInputIcon,
  FileOutputIcon,
  FileTextIcon,
  GavelIcon,
  LineChartIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  MicVocalIcon,
  MoonIcon,
  MoreVerticalIcon,
  PaletteIcon,
  PlusIcon,
  RadioIcon,
  RocketIcon,
  SendIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  SunIcon,
  TerminalIcon,
  UserRoundIcon,
  UsersRoundIcon,
  VideoIcon,
  WandSparklesIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@supagen/ui/lib/utils";

const iconMap = {
  account_tree: BlocksIcon,
  add: PlusIcon,
  arrow_downward: ArrowDownIcon,
  arrow_forward: ArrowRightIcon,
  arrow_upward: ArrowUpIcon,
  attach_money: CircleDollarSignIcon,
  auto_awesome: WandSparklesIcon,
  bolt: ZapIcon,
  cable: CableIcon,
  campaign: MegaphoneIcon,
  chat: BotIcon,
  check_circle: CircleCheckIcon,
  close: XIcon,
  code: Code2Icon,
  content_copy: CopyIcon,
  dashboard: LayoutDashboardIcon,
  dark_mode: MoonIcon,
  data_object: DatabaseIcon,
  description: FileTextIcon,
  expand_more: ChevronDownIcon,
  extension: BlocksIcon,
  face: UserRoundIcon,
  gavel: GavelIcon,
  graphic_eq: RadioIcon,
  groups: UsersRoundIcon,
  image: ImageIcon,
  input: FileInputIcon,
  inventory_2: BoxesIcon,
  light_mode: SunIcon,
  monitoring: LineChartIcon,
  more_vert: MoreVerticalIcon,
  movie: VideoIcon,
  output: FileOutputIcon,
  palette: PaletteIcon,
  payments: BadgeDollarSignIcon,
  psychology: BrainIcon,
  record_voice_over: MicVocalIcon,
  rocket_launch: RocketIcon,
  schedule: ClockIcon,
  send: SendIcon,
  settings: SettingsIcon,
  smart_toy: BotIcon,
  support_agent: UserRoundIcon,
  terminal: TerminalIcon,
  tune: SlidersHorizontalIcon,
  videocam: VideoIcon,
} as const;

export type MarketingIconName = keyof typeof iconMap;

type MarketingIconProps = {
  name: MarketingIconName;
  className?: string;
  style?: CSSProperties;
};

export function MarketingIcon({ name, className, style }: MarketingIconProps) {
  const Icon = iconMap[name];

  return (
    <Icon
      aria-hidden="true"
      className={cn("marketing-icon", className)}
      style={style}
      strokeWidth={2}
    />
  );
}
