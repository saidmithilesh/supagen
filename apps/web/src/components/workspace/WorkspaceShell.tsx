import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@supagen/ui/components/avatar";
import { MaterialIcon } from "@supagen/ui/components/material-icon";
import { cn } from "@supagen/ui/lib/utils";

type WorkspaceOverviewPageProps = {
  workspaceId: string;
};

type NavItem = {
  icon: string;
  label: string;
  segment: string;
};

const WORKSPACE_NAME = "Test Workspace 3";
const WORKSPACE_PLAN = "Free plan";
const WORKSPACE_INITIAL = "T";
const ACCOUNT_NAME = "Mithilesh Said";
const ACCOUNT_INITIALS = "MS";
const SIDEBAR_STATE_STORAGE_KEY = "workspace-sidebar-state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    icon: "space_dashboard",
    label: "Overview",
    segment: "overview",
  },
  {
    icon: "description",
    label: "Templates",
    segment: "templates",
  },
  {
    icon: "receipt_long",
    label: "Invocations",
    segment: "invocations",
  },
  {
    icon: "query_stats",
    label: "Analytics",
    segment: "analytics",
  },
  {
    icon: "group",
    label: "Members",
    segment: "members",
  },
];

const DEVELOPER_NAV_ITEMS: NavItem[] = [
  {
    icon: "key",
    label: "API Keys",
    segment: "developer/api-keys",
  },
  {
    icon: "vpn_key",
    label: "LLM Keys",
    segment: "developer/llm-keys",
  },
  {
    icon: "cable",
    label: "Connect MCP",
    segment: "developer/connect-mcp",
  },
  {
    icon: "model_training",
    label: "Models",
    segment: "developer/models",
  },
];

const UTILITY_NAV_ITEMS: NavItem[] = [
  {
    icon: "help",
    label: "Help & Docs",
    segment: "help",
  },
  {
    icon: "notifications",
    label: "Notifications",
    segment: "notifications",
  },
];

export function WorkspaceOverviewPage({
  workspaceId,
}: WorkspaceOverviewPageProps) {
  const [isCollapsed, setIsCollapsed] = useState(readInitialSidebarState);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STATE_STORAGE_KEY,
      isCollapsed ? "collapsed" : "expanded",
    );
    document.cookie = `sidebar_state=${String(!isCollapsed)}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [isCollapsed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "b" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      setIsCollapsed((current) => !current);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-svh bg-main-content text-foreground">
      <WorkspaceSidebar
        isCollapsed={isCollapsed}
        onToggleCollapsed={() => setIsCollapsed((current) => !current)}
        workspaceId={workspaceId}
      />
      <main
        aria-label="Workspace overview"
        className={cn(
          "min-h-svh bg-main-content transition-[margin-left] duration-200 ease-linear",
          isCollapsed ? "ml-16" : "ml-60",
        )}
      />
    </div>
  );
}

function readInitialSidebarState() {
  if (typeof window === "undefined") {
    return false;
  }

  const storedState = window.localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY);

  return storedState === "collapsed" || storedState === "true";
}

export function WorkspaceOverviewRootRoute() {
  const { workspaceId } = useParams({ from: "/app_/workspaces/$workspaceId" });

  return <WorkspaceOverviewPage workspaceId={workspaceId} />;
}

export function WorkspaceOverviewRoute() {
  const { workspaceId } = useParams({
    from: "/app_/workspaces/$workspaceId_/overview",
  });

  return <WorkspaceOverviewPage workspaceId={workspaceId} />;
}

function WorkspaceSidebar({
  isCollapsed,
  onToggleCollapsed,
  workspaceId,
}: {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  workspaceId: string;
}) {
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(true);
  const workspaceBasePath = `/app/workspaces/${encodeURIComponent(
    workspaceId,
  )}`;

  return (
    <aside
      aria-label="Workspace navigation"
      className={cn(
        "fixed top-0 left-0 z-10 flex h-svh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[left,right,width] duration-200 ease-linear",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex min-h-full flex-col">
        <BrandHeader isCollapsed={isCollapsed} />
        <WorkspaceSwitcher isCollapsed={isCollapsed} />

        <nav
          aria-label="Workspace pages"
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto",
            isCollapsed ? "px-0" : "px-4",
          )}
        >
          <div className="flex flex-col gap-1">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <SidebarNavLink
                isActive={item.segment === "overview"}
                isCollapsed={isCollapsed}
                item={item}
                key={item.label}
                workspaceBasePath={workspaceBasePath}
              />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <DeveloperNavGroup
              isDeveloperOpen={isDeveloperOpen}
              isCollapsed={isCollapsed}
              onToggleDeveloper={() =>
                setIsDeveloperOpen((current) => !current)
              }
              workspaceBasePath={workspaceBasePath}
            />

            <SidebarNavLink
              isCollapsed={isCollapsed}
              item={{
                icon: "payments",
                label: "Billing",
                segment: "billing",
              }}
              workspaceBasePath={workspaceBasePath}
            />
          </div>
        </nav>

        <div className="shrink-0 bg-sidebar">
          <div className={cn("py-2", isCollapsed ? "px-0" : "px-4")}>
            <button
              aria-expanded={!isCollapsed}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-[13px] leading-none font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
                isCollapsed ? "justify-center gap-0 px-0" : "gap-3",
              )}
              onClick={onToggleCollapsed}
              type="button"
            >
              <MaterialIcon
                className="shrink-0"
                name={isCollapsed ? "left_panel_open" : "left_panel_close"}
              />
              <span className={cn(isCollapsed && "sr-only")}>
                {isCollapsed ? "Expand" : "Collapse"}
              </span>
            </button>
          </div>

          <div
            className={cn(
              "border-t border-sidebar-border",
              !isCollapsed && "-mx-4",
            )}
          />

          <div
            className={cn(
              "flex flex-col gap-0.5 py-2",
              isCollapsed ? "px-0" : "px-4",
            )}
          >
            <nav
              aria-label="Workspace utilities"
              className="flex flex-col gap-0.5"
            >
              {UTILITY_NAV_ITEMS.map((item) => (
                <SidebarNavLink
                  isCollapsed={isCollapsed}
                  item={item}
                  key={item.label}
                  tone="muted"
                  workspaceBasePath={workspaceBasePath}
                />
              ))}
            </nav>

            <button
              aria-label={ACCOUNT_NAME}
              className={cn(
                "flex items-center rounded-lg px-2.5 py-[7px] text-sm leading-none font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
                isCollapsed ? "justify-center gap-0 px-0" : "gap-2.5",
              )}
              type="button"
            >
              <Avatar className="size-[26px] after:hidden">
                <AvatarFallback className="bg-primary text-[10px] font-bold text-white">
                  {ACCOUNT_INITIALS}
                </AvatarFallback>
              </Avatar>
              <span className={cn("truncate", isCollapsed && "sr-only")}>
                {ACCOUNT_NAME}
              </span>
              <MaterialIcon
                className={cn(
                  "ml-auto shrink-0 text-muted-foreground",
                  isCollapsed && "hidden",
                )}
                name="unfold_more"
                size={16}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function BrandHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <a
      aria-label="Supagen"
      className={cn(
        "flex items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
        isCollapsed ? "justify-center px-0 py-3" : "gap-3 p-4 pb-3",
      )}
      href="/app"
    >
      <img alt="" className="size-9 shrink-0" src="/logo.svg" />
      <span
        className={cn(
          "text-base font-bold tracking-normal text-foreground",
          isCollapsed && "sr-only",
        )}
      >
        Supagen
      </span>
    </a>
  );
}

function WorkspaceSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={cn("pb-2", isCollapsed ? "px-0" : "px-3")}>
      <button
        aria-label={WORKSPACE_NAME}
        className={cn(
          "flex w-full items-center rounded-lg py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
          isCollapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
        )}
        type="button"
      >
        <Avatar className="size-7 rounded-lg after:hidden">
          <AvatarFallback className="rounded-lg bg-muted text-[11px] font-bold text-muted-foreground">
            {WORKSPACE_INITIAL}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col items-start overflow-hidden",
            isCollapsed && "sr-only",
          )}
        >
          <p className="w-full truncate text-left text-[13px] font-semibold text-foreground">
            {WORKSPACE_NAME}
          </p>
          <p className="text-left text-[11px] text-muted-foreground">
            {WORKSPACE_PLAN}
          </p>
        </div>

        <MaterialIcon
          className={cn(
            "shrink-0 text-muted-foreground",
            isCollapsed && "hidden",
          )}
          name="unfold_more"
          size={16}
        />
      </button>
    </div>
  );
}

function SidebarNavLink({
  isActive = false,
  isCollapsed,
  item,
  tone = "default",
  workspaceBasePath,
}: {
  isActive?: boolean;
  isCollapsed: boolean;
  item: NavItem;
  tone?: "default" | "muted";
  workspaceBasePath: string;
}) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] leading-none outline-none transition-colors focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
        isActive
          ? "bg-sidebar-active font-bold text-sidebar-primary"
          : cn(
              "font-medium hover:bg-muted hover:text-foreground",
              tone === "muted"
                ? "text-muted-foreground"
                : "text-sidebar-foreground",
            ),
        isCollapsed && "justify-center gap-0 px-0",
      )}
      href={`${workspaceBasePath}/${item.segment}`}
    >
      <MaterialIcon className="shrink-0" name={item.icon} />
      <span className={cn("truncate", isCollapsed && "sr-only")}>
        {item.label}
      </span>
    </a>
  );
}

function DeveloperNavGroup({
  isDeveloperOpen,
  isCollapsed,
  onToggleDeveloper,
  workspaceBasePath,
}: {
  isDeveloperOpen: boolean;
  isCollapsed: boolean;
  onToggleDeveloper: () => void;
  workspaceBasePath: string;
}) {
  return (
    <div className="flex flex-col">
      <button
        aria-expanded={isDeveloperOpen}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] leading-none font-medium text-sidebar-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
          isCollapsed && "justify-center gap-0 px-0",
        )}
        onClick={onToggleDeveloper}
        type="button"
      >
        <MaterialIcon className="shrink-0" name="code" />
        <span className={cn("truncate", isCollapsed && "sr-only")}>
          Developer
        </span>
        <MaterialIcon
          className={cn(
            "ml-auto text-muted-foreground transition-transform duration-150",
            isDeveloperOpen && "rotate-180",
            isCollapsed && "hidden",
          )}
          name="expand_more"
          size={18}
        />
      </button>

      {!isCollapsed && isDeveloperOpen ? (
        <div className="flex flex-col gap-0.5 py-0.5 pl-4">
          {DEVELOPER_NAV_ITEMS.map((item) => (
            <SidebarSubNavLink
              item={item}
              key={item.label}
              workspaceBasePath={workspaceBasePath}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarSubNavLink({
  item,
  workspaceBasePath,
}: {
  item: NavItem;
  workspaceBasePath: string;
}) {
  return (
    <a
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] leading-none font-medium text-sidebar-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40"
      href={`${workspaceBasePath}/${item.segment}`}
    >
      <MaterialIcon className="shrink-0" name={item.icon} size={18} />
      <span className="truncate">{item.label}</span>
    </a>
  );
}
