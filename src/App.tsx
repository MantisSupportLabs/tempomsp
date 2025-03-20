import { Suspense, lazy } from "react";
import {
  useRoutes,
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useEffect } from "react";
import routes from "tempo-routes";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";

// Lazy load components
const Home = lazy(() => import("./components/home"));
const TechnicianRoute = lazy(() => import("./components/TechnicianRoute"));
const Login = lazy(() => import("./routes/Login"));

function App() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Handle browser back button
  useEffect(() => {
    if (navigationType === "POP") {
      // Prevent default back behavior and handle it manually
      window.history.pushState(null, "", location.pathname);
    }
  }, [location, navigationType]);

  // Add event listener for popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back behavior
      window.history.pushState(null, "", location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location.pathname]);
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <AuthGuard allowedRoles={["client", "admin"]}>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/technician"
              element={
                <AuthGuard allowedRoles={["technician", "admin"]}>
                  <TechnicianRoute />
                </AuthGuard>
              }
            />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
