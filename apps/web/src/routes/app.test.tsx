import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getProfileInitials } from "../auth/profile";
import { AppWorkspacePage } from "./app";

const clerkMocks = vi.hoisted(() => ({
  useUser: vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  UserButton: () => <button type="button">User menu</button>,
  useUser: clerkMocks.useUser,
}));

describe(AppWorkspacePage.name, () => {
  it("renders a loading state while Clerk user data loads", () => {
    clerkMocks.useUser.mockReturnValue({
      isLoaded: false,
      user: null,
    });

    render(<AppWorkspacePage />);

    expect(screen.getByLabelText("Loading profile")).toBeInTheDocument();
  });

  it("renders the signed-in user's profile details", () => {
    clerkMocks.useUser.mockReturnValue({
      isLoaded: true,
      user: {
        emailAddresses: [],
        firstName: "Mithilesh",
        fullName: "Mithilesh Said",
        id: "user_123",
        imageUrl: "https://example.com/avatar.png",
        primaryEmailAddress: {
          emailAddress: "mith@supalabs.dev",
        },
        username: null,
      },
    });

    render(<AppWorkspacePage />);

    expect(
      screen.getByRole("heading", { name: "Your profile" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Mithilesh Said")[0]).toBeInTheDocument();
    expect(screen.getAllByText("mith@supalabs.dev")[0]).toBeInTheDocument();
    expect(screen.getByText("user_123")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "User menu" }),
    ).toBeInTheDocument();
  });
});

describe(getProfileInitials.name, () => {
  it("uses name initials first", () => {
    expect(getProfileInitials("Mithilesh Said", "mith@supalabs.dev")).toBe(
      "MS",
    );
  });

  it("falls back to email initials", () => {
    expect(getProfileInitials("", "mith@supalabs.dev")).toBe("MI");
  });
});
