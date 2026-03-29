import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { RoomDetailPage } from "./pages/RoomDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { InfoPage } from "./pages/InfoPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "search", Component: SearchPage },
      { path: "room/:id", Component: RoomDetailPage },
      { path: "favorites", Component: FavoritesPage },
      { path: "profile", Component: ProfilePage },
      { path: "owner", Component: OwnerDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "pricing", Component: InfoPage },
      { path: "guide", Component: InfoPage },
      { path: "terms", Component: InfoPage },
      { path: "privacy", Component: InfoPage },
      { path: "rules", Component: InfoPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
]);
