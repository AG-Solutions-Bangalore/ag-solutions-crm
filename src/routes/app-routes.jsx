import Login from "@/app/auth/login";
import NotFound from "@/app/errors/not-found";
import Settings from "@/app/setting/setting";
import Maintenance from "@/components/common/maintenance";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import LoadingBar from "@/components/loader/loading-bar";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import Dashboard from "@/app/dashboard/dashboard";
import EnquiryList from "@/app/Enquiry/EnquiryList";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/enquiries"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EnquiryList />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
