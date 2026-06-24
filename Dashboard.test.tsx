import { vi, describe, test, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Dashboard from "./Dashboard";

const getUserGroupsMock = vi.hoisted(() => vi.fn());

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "1",
      name: "test",
      email: "test@test.com",
    },
  }),
}));

vi.mock("../lib/store", () => ({
  getUserGroups: getUserGroupsMock,
  createGroup: vi.fn(),
  joinGroupByCode: vi.fn(),
}));





//show the name
test("shows logged in user's name", async () => {
    getUserGroupsMock.mockResolvedValue([]);

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(screen.getByText(/hey, test/i)).toBeTruthy();
});


//check if create group opens
test("opens create group form", () => {
    getUserGroupsMock.mockResolvedValue([]);

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText(/new group/i));

  expect(screen.getByText(/create a new group/i)).toBeTruthy();
});

//check if join group opens
test("opens join group form", () => {
    getUserGroupsMock.mockResolvedValue([]);

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText(/join group/i));

  expect(screen.getByText(/join a group/i)).toBeTruthy();
});