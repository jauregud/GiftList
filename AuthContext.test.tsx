import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function TestComponent() {
  const { user } = useAuth();

  return <div>{user?.name ?? "No User"}</div>;
}




/*test("loads saved user from localStorage", async () => {
  localStorage.setItem(
    "giftlist_demo_user",
    JSON.stringify({
      id: "1",
      name: "test",
      email: "test@test.com",
    })
  );

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  expect(await screen.findByText("test")).toBeTruthy();
});*/




test("shows No User when localStorage is empty", () => {
  localStorage.removeItem("giftlist_demo_user");

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  expect(screen.getByText("No User")).toBeTruthy();
});


test("provider renders children", () => {
  render(
    <AuthProvider>
      <div>Hello</div>
    </AuthProvider>
  );

  expect(screen.getByText("Hello")).toBeTruthy();
});