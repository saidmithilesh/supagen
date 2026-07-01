import { useClerk } from "@clerk/tanstack-react-start";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@supagen/ui/components/avatar";
import { Badge } from "@supagen/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@supagen/ui/components/dropdown-menu";
import { MaterialIcon } from "@supagen/ui/components/material-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@supagen/ui/components/sidebar";
import { cn } from "@supagen/ui/lib/utils";

import type { IamProfile } from "../../api/iam-profile";
import { useSupagenTheme } from "../../theme/use-supagen-theme";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import {
  clearLastVisitedWorkspaceId,
  persistLastVisitedWorkspaceId,
} from "./workspace-navigation";
import {
  DEVELOPER_NAV_ITEMS,
  getInitial,
  getWorkspaceSwitcherData,
  type NavItem,
  PRIMARY_NAV_ITEMS,
  UTILITY_NAV_ITEMS,
  WORKSPACE_PLAN,
  type WorkspaceSwitcherData,
} from "./workspace-sidebar-model";

const ACCOUNT_NAME = "Mithilesh Said";
const ACCOUNT_EMAIL = "mithilesh@supagen.dev";
const ACCOUNT_INITIALS = "MS";
const PENDING_INVITES_COUNT = 0;

type WorkspaceSidebarProps = {
  onNavigateToWorkspace?: (workspaceId: string) => void;
  profile: IamProfile | undefined;
  workspaceId: string;
};

export function WorkspaceSidebar({
  onNavigateToWorkspace,
  profile,
  workspaceId,
}: WorkspaceSidebarProps) {
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(true);
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const workspaceBasePath = `/app/workspaces/${encodeURIComponent(
    workspaceId,
  )}`;
  const workspaceSwitcherData = getWorkspaceSwitcherData(profile, workspaceId);

  return (
    <Sidebar
      aria-label="Workspace navigation"
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader
        className={cn(
          "p-4 pb-3 transition-[padding] duration-200 ease-linear",
          isCollapsed && "px-0 py-3",
        )}
      >
        <BrandHeader isCollapsed={isCollapsed} />
      </SidebarHeader>

      <div
        className={cn(
          "px-3 pb-2 transition-[padding] duration-200 ease-linear",
          isCollapsed && "px-0",
        )}
      >
        <WorkspaceSwitcher
          data={workspaceSwitcherData}
          isCollapsed={isCollapsed}
          onNavigateToWorkspace={onNavigateToWorkspace}
          profile={profile}
          workspaceId={workspaceId}
        />
      </div>

      <SidebarContent>
        <SidebarGroup className="p-0 px-4 transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {PRIMARY_NAV_ITEMS.map((item) => (
                <SidebarNavLink
                  isActive={item.segment === "overview"}
                  item={item}
                  key={item.label}
                  workspaceBasePath={workspaceBasePath}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0 px-4 transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <DeveloperNavGroup
                isDeveloperOpen={isDeveloperOpen}
                onToggleDeveloper={() =>
                  setIsDeveloperOpen((current) => !current)
                }
                workspaceBasePath={workspaceBasePath}
              />

              <SidebarNavLink
                item={{
                  icon: "payments",
                  label: "Billing",
                  segment: "billing",
                }}
                workspaceBasePath={workspaceBasePath}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div
        className={cn(
          "px-4 py-2 transition-[padding] duration-200 ease-linear",
          isCollapsed && "px-0",
        )}
      >
        <button
          aria-expanded={!isCollapsed}
          className={cn(
            "flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground outline-none transition-[padding,gap] duration-200 ease-linear hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
            isCollapsed && "justify-center gap-0 px-0",
          )}
          onClick={toggleSidebar}
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

      <SidebarSeparator className="mx-0" />

      <SidebarFooter
        className={cn(
          "px-4 py-2 transition-[padding] duration-200 ease-linear",
          isCollapsed && "px-0",
        )}
      >
        <SidebarMenu className="gap-0.5">
          {UTILITY_NAV_ITEMS.map((item) => (
            <SidebarNavLink
              item={item}
              key={item.label}
              tone="muted"
              workspaceBasePath={workspaceBasePath}
            />
          ))}

          <SidebarMenuItem>
            <UserMenu isCollapsed={isCollapsed} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function BrandHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <a
      aria-label="Supagen"
      className={cn(
        "flex items-center rounded-lg outline-none transition-[padding,gap] duration-200 ease-linear focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
        isCollapsed ? "justify-center gap-0" : "gap-3",
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

function WorkspaceSwitcher({
  data,
  isCollapsed,
  onNavigateToWorkspace = (workspaceId) => {
    window.location.assign(
      `/app/workspaces/${encodeURIComponent(workspaceId)}/overview`,
    );
  },
  profile,
  workspaceId,
}: {
  data: WorkspaceSwitcherData;
  isCollapsed: boolean;
  onNavigateToWorkspace?: (workspaceId: string) => void;
  profile: IamProfile | undefined;
  workspaceId: string;
}) {
  const { currentWorkspace, groups, shouldShowOrgGroups } = data;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [openGroupIds, setOpenGroupIds] = useState<ReadonlySet<string>>(
    () => new Set([currentWorkspace.orgId]),
  );

  function navigateToWorkspace(nextWorkspaceId: string) {
    persistLastVisitedWorkspaceId(window.localStorage, nextWorkspaceId);
    onNavigateToWorkspace(nextWorkspaceId);
  }

  function resetOpenGroups() {
    setOpenGroupIds(new Set([currentWorkspace.orgId]));
  }

  function toggleGroup(groupId: string) {
    setOpenGroupIds((current) => {
      const next = new Set(current);

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      return next;
    });
  }

  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            resetOpenGroups();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            aria-label={currentWorkspace.name}
            className={cn(
              "flex w-full items-center rounded-lg py-2 text-left outline-none transition-[padding,gap] duration-200 ease-linear hover:bg-muted focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
              isCollapsed ? "justify-center gap-0 px-0" : "gap-2.5 px-2.5",
            )}
            type="button"
          >
            <Avatar className="size-7 rounded-lg after:hidden">
              <AvatarFallback className="rounded-lg bg-muted text-[11px] font-bold text-muted-foreground">
                {getInitial(currentWorkspace.name)}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col items-start overflow-hidden",
                isCollapsed && "sr-only",
              )}
            >
              <p className="w-full truncate text-left text-[13px] font-semibold text-foreground">
                {currentWorkspace.name}
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
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[220px] rounded-lg p-1.5"
          side="bottom"
        >
          {groups.map((group, groupIndex) => {
            const isGroupOpen =
              !shouldShowOrgGroups || openGroupIds.has(group.id);

            return (
              <DropdownMenuGroup key={group.id}>
                {shouldShowOrgGroups ? (
                  <button
                    aria-expanded={isGroupOpen}
                    className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-left text-[11px] font-semibold text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleGroup(group.id);
                    }}
                    type="button"
                  >
                    <MaterialIcon
                      className={cn(
                        "shrink-0 transition-transform duration-150",
                        isGroupOpen && "rotate-90",
                      )}
                      name="chevron_right"
                      size={14}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {group.name}
                    </span>
                  </button>
                ) : null}

                {isGroupOpen
                  ? group.workspaces.map((workspace) => {
                      const isCurrent = workspace.id === currentWorkspace.id;

                      return (
                        <DropdownMenuItem
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 px-2.5 py-2 text-[13px]",
                            shouldShowOrgGroups && "ml-3",
                            isCurrent && "bg-sidebar-active font-semibold",
                          )}
                          key={workspace.id}
                          onSelect={(event) => {
                            event.preventDefault();
                            navigateToWorkspace(workspace.id);
                          }}
                        >
                          <div
                            aria-hidden="true"
                            className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-muted text-[9px] font-bold text-muted-foreground"
                          >
                            {getInitial(workspace.name)}
                          </div>
                          <span className="flex-1 truncate text-sm">
                            {workspace.name}
                          </span>
                          <span
                            aria-hidden="true"
                            className="flex items-center justify-center rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <MaterialIcon name="settings" size={14} />
                          </span>
                        </DropdownMenuItem>
                      );
                    })
                  : null}

                {shouldShowOrgGroups && groupIndex < groups.length - 1 ? (
                  <DropdownMenuSeparator />
                ) : null}
              </DropdownMenuGroup>
            );
          })}

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="flex cursor-pointer items-center gap-2.5"
            >
              <a href="/workspaces">
                <MaterialIcon
                  className="text-muted-foreground"
                  name="apps"
                  size={16}
                />
                <span>All workspaces</span>
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2.5"
              onSelect={(event) => {
                event.preventDefault();
                setIsCreateDialogOpen(true);
              }}
            >
              <MaterialIcon
                className="text-muted-foreground"
                name="add"
                size={16}
              />
              <span>Create workspace</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog
        currentWorkspaceId={workspaceId}
        onCreated={navigateToWorkspace}
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
        profile={profile}
      />
    </>
  );
}

function SidebarNavLink({
  isActive = false,
  item,
  tone = "default",
  workspaceBasePath,
}: {
  isActive?: boolean;
  item: NavItem;
  tone?: "default" | "muted";
  workspaceBasePath: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          "leading-none",
          isActive &&
            "data-[active=true]:bg-sidebar-active data-[active=true]:font-bold data-[active=true]:text-sidebar-primary",
          !isActive &&
            tone === "muted" &&
            "text-muted-foreground hover:text-foreground",
        )}
        isActive={isActive}
        tooltip={item.label}
      >
        <a
          aria-current={isActive ? "page" : undefined}
          href={`${workspaceBasePath}/${item.segment}`}
        >
          <MaterialIcon className="shrink-0" name={item.icon} />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {item.label}
          </span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function DeveloperNavGroup({
  isDeveloperOpen,
  onToggleDeveloper,
  workspaceBasePath,
}: {
  isDeveloperOpen: boolean;
  onToggleDeveloper: () => void;
  workspaceBasePath: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="leading-none"
        onClick={onToggleDeveloper}
        tooltip="Developer"
        type="button"
      >
        <MaterialIcon className="shrink-0" name="code" />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          Developer
        </span>
        <MaterialIcon
          className={cn(
            "ml-auto text-muted-foreground transition-transform duration-150 group-data-[collapsible=icon]:hidden",
            isDeveloperOpen && "rotate-180",
          )}
          name="expand_more"
          size={18}
        />
      </SidebarMenuButton>

      {isDeveloperOpen ? (
        <SidebarMenuSub>
          {DEVELOPER_NAV_ITEMS.map((item) => (
            <SidebarMenuSubItem key={item.label}>
              <SidebarMenuSubButton
                className="h-auto gap-3 rounded-lg px-3 py-2.5 text-[13px] leading-none font-medium text-sidebar-foreground hover:bg-muted hover:text-foreground"
                href={`${workspaceBasePath}/${item.segment}`}
              >
                <MaterialIcon className="shrink-0" name={item.icon} size={18} />
                <span>{item.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function UserMenu({ isCollapsed }: { isCollapsed: boolean }) {
  const { signOut } = useClerk();
  const { theme, updateTheme } = useSupagenTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={ACCOUNT_NAME}
          className={cn(
            "flex w-full items-center rounded-lg px-2.5 py-[7px] text-sm leading-none font-medium text-foreground outline-none transition-[padding,gap] duration-200 ease-linear hover:bg-muted focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
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
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[220px] rounded-lg p-1.5"
        side="top"
      >
        <div className="mb-1 border-b border-border px-2.5 py-2">
          <p className="text-[11px] text-muted-foreground">{ACCOUNT_EMAIL}</p>
        </div>

        <DropdownMenuItem asChild>
          <a className="flex items-center gap-2.5" href="/app/profile">
            <MaterialIcon
              className="text-muted-foreground"
              name="person"
              size={16}
            />
            <span>Profile</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a className="flex items-center gap-2.5" href="/app/invites">
            <MaterialIcon
              className="text-muted-foreground"
              name="mail"
              size={16}
            />
            <span className="flex-1">Invites</span>
            {PENDING_INVITES_COUNT > 0 ? (
              <Badge className="h-4 min-w-4 px-1 text-[10px]">
                {PENDING_INVITES_COUNT}
              </Badge>
            ) : null}
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a className="flex items-center gap-2.5" href="/app/admin">
            <MaterialIcon
              className="text-muted-foreground"
              name="admin_panel_settings"
              size={16}
            />
            <span>Admin Panel</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2.5 py-2">
          <span className="text-sm text-foreground">Theme</span>
          <div className="flex gap-0.5 rounded-md bg-muted p-[3px]">
            <button
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-sm transition-colors",
                theme === "light"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={(event) => {
                event.stopPropagation();
                updateTheme("light");
              }}
              title="Light"
              type="button"
            >
              <MaterialIcon name="light_mode" size={16} />
            </button>
            <button
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-sm transition-colors",
                theme === "dark"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={(event) => {
                event.stopPropagation();
                updateTheme("dark");
              }}
              title="Dark Cool"
              type="button"
            >
              <MaterialIcon name="dark_mode" size={16} />
            </button>
            <button
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-sm transition-colors",
                theme === "dark-warm"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={(event) => {
                event.stopPropagation();
                updateTheme("dark-warm");
              }}
              title="Dark Warm"
              type="button"
            >
              <MaterialIcon name="nightlight" size={16} />
            </button>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            clearLastVisitedWorkspaceId(window.localStorage);
            void signOut();
          }}
          variant="destructive"
        >
          <MaterialIcon name="logout" size={16} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
