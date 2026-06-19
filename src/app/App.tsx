import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthProvider } from "../contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: "Nunito, system-ui, sans-serif",
            fontWeight: 600,
            borderRadius: "1rem",
          },
        }}
      />
    </AuthProvider>
  );
}
