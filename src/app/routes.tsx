import { createBrowserRouter } from "react-router";
import Layout from "../components/Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import GroupView from "../pages/GroupView";
import JoinGroup from "../pages/JoinGroup";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
  },
  {
    path: "/groups/:id",
    element: (
      <Layout>
        <GroupView />
      </Layout>
    ),
  },
  {
    path: "/join/:code",
    element: (
      <Layout>
        <JoinGroup />
      </Layout>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">404</h1>
          <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
          <a href="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Go home
          </a>
        </div>
      </Layout>
    ),
  },
]);
