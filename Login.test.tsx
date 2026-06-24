import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Login from "./Login";
import { MemoryRouter } from "react-router";

// IMPORTANT: hoisted mock function
const signInMock = vi.hoisted(() => vi.fn());

// MOCKS (ONLY ONCE, TOP LEVEL)
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    signIn: signInMock,
    isDemoMode: true,
  }),
}));

vi.mock("../lib/firebase", () => ({
  firebaseSignInWithEmail: vi.fn(() => {
    throw new Error("Invalid password");
  }),
  firebaseCreateAccount: vi.fn(),
  firebaseSignInWithGoogle: vi.fn(),
  isFirebaseConfigured: true,
}));

describe("Login", () => {
  test("demo mode signs in user", async () => {
    render(
    <MemoryRouter>
        <Login />
    </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
  target: { value: "test@test.com" },
});

    fireEvent.click(screen.getByText("Sign in"));

    await screen.findByText(/please wait/i);
  });

  test("demo register creates user", async () => {
    render(
    <MemoryRouter>
        <Login />
    </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create account"));

    fireEvent.change(screen.getByPlaceholderText("Sarah Johnson"), {
      target: { value: "Gabe" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "gabe@test.com" },
    });

    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalled();
    });
  });

  test("shows error on login failure", async () => {
    render(
    <MemoryRouter>
        <Login />
    </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
  target: { value: "test@test.com" },
});

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText("Sign in"));

    await screen.findByText(/invalid password/i);
  });
});