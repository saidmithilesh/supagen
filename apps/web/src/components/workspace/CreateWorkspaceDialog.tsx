import { useAuth } from "@clerk/tanstack-react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@supagen/ui/components/alert";
import { Button } from "@supagen/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@supagen/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@supagen/ui/components/field";
import { Input } from "@supagen/ui/components/input";
import { MaterialIcon } from "@supagen/ui/components/material-icon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@supagen/ui/components/select";
import { Textarea } from "@supagen/ui/components/textarea";

import {
  createIamWorkspace,
  type CreateIamWorkspaceInput,
  type IamProfile,
} from "../../api/iam-profile";
import { IAM_PROFILE_QUERY_KEY } from "./use-workspace-profile";
import { findWorkspaceInProfile } from "./workspace-navigation";

type CreateWorkspaceDialogProps = {
  currentWorkspaceId: string;
  onCreated: (workspaceId: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  profile: IamProfile | undefined;
};

export function CreateWorkspaceDialog({
  currentWorkspaceId,
  onCreated,
  onOpenChange,
  open,
  profile,
}: CreateWorkspaceDialogProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const eligibleOrganizations = useMemo(
    () =>
      profile?.memberships
        .filter(
          (membership) =>
            membership.role === "owner" || membership.role === "admin",
        )
        .map((membership) => membership.organization) ?? [],
    [profile],
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createWorkspace = useMutation({
    mutationFn: async (input: CreateIamWorkspaceInput) => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk session token.");
      }

      return await createIamWorkspace(token, input);
    },
    onSuccess: async (workspace) => {
      await queryClient.invalidateQueries({ queryKey: IAM_PROFILE_QUERY_KEY });
      resetForm();
      onOpenChange(false);
      onCreated(workspace.id);
    },
    onError: () => {
      setSubmitError("Failed to create workspace.");
    },
  });
  const canCreate = eligibleOrganizations.length > 0;
  const isPending = createWorkspace.isPending;
  const currentWorkspace = profile
    ? findWorkspaceInProfile(profile, currentWorkspaceId)
    : null;
  const currentOrganizationId = currentWorkspace?.membership.organization.id;
  const defaultOrganizationId =
    eligibleOrganizations.find(
      (organization) => organization.id === currentOrganizationId,
    )?.id ?? eligibleOrganizations.at(0)?.id;
  const selectedOrganizationId = organizationId || defaultOrganizationId || "";

  function resetForm() {
    setName("");
    setDescription("");
    setNameError(null);
    setSubmitError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Workspace name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setNameError("Workspace name must be 100 characters or fewer.");
      return;
    }

    setNameError(null);

    if (!selectedOrganizationId) {
      return;
    }

    createWorkspace.mutate({
      organizationId: selectedOrganizationId,
      name: trimmedName,
      description: description.trim() || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={Boolean(nameError)}>
              <FieldLabel htmlFor="workspace-name">Name *</FieldLabel>
              <Input
                aria-invalid={Boolean(nameError)}
                disabled={isPending}
                id="workspace-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="My Workspace"
                value={name}
              />
              <FieldError>{nameError}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="workspace-description">
                Description
              </FieldLabel>
              <Textarea
                disabled={isPending}
                id="workspace-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What's this workspace for?"
                rows={3}
                value={description}
              />
            </Field>

            <Field data-disabled={!canCreate}>
              <FieldLabel>Organization</FieldLabel>
              <Select
                disabled={!canCreate || isPending}
                onValueChange={setOrganizationId}
                value={selectedOrganizationId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {eligibleOrganizations.map((organization) => (
                      <SelectItem key={organization.id} value={organization.id}>
                        {organization.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          {!canCreate ? (
            <Alert>
              <MaterialIcon name="info" />
              <AlertTitle>Admin access required</AlertTitle>
              <AlertDescription>
                You need admin access to an organization to create a workspace.
              </AlertDescription>
            </Alert>
          ) : null}

          {submitError ? (
            <Alert variant="destructive">
              <MaterialIcon name="error" />
              <AlertTitle>Workspace not created</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={!canCreate || isPending} type="submit">
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
