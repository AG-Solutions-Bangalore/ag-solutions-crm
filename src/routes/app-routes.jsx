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
import Projects from "@/app/Projects/Projects";
import CreateProjects from "@/app/Projects/CreateProjects";
import Newsletter from "@/app/Newsletter/Newsletter";
import Category from "@/app/category/Category";
import CreateCategory from "@/app/category/createCategory";
import GalleryList from "@/app/gallery/gallery-list";
import { SPONSAR_API } from "@/constants/apiConstants";
import Sponsor from "@/app/sponsor/sponsor";

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
            path="/gallery-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <GalleryList />
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
            path="/Category-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Category />
              </Suspense>
            }
          />

          <Route
            path="/Sponsar-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Sponsor />
              </Suspense>
            }
          />

          <Route
            path="/create-project"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateProjects />
              </Suspense>
            }
          />

          <Route
            path="/newsLetter"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Newsletter />
              </Suspense>
            }
          />
          <Route
            path="/create-category"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateCategory />
              </Suspense>
            }
          />
          <Route
            path="/projects"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Projects />
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
