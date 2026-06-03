import {
  DefaultErrorBoundary,
  Footer,
  Header,
  NotProductionWarning,
} from "blaise-design-system-react-components";
import { Authenticate } from "blaise-login-react-client";
import { type ReactElement } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import { getSharedAuthOptions, isProduction } from "./env";
import DisableUac from "./pages/disableUacPage/disableUacPage";
import EnableUac from "./pages/enableUacPage/enableUacPage";
import UploadedSamplesPage from "./pages/uploadedSamplesPage/uploadedSamplesPage";
import UploadSample from "./pages/uploadSamplePage/uploadSamplePage";
import UploadUsedUacs from "./pages/uploadUsedUacsPage/uploadUsedUacsPage";

import type { User } from "blaise-api-node-client";

const navigationLinks = [
  { id: "home-link", label: "Home", endpoint: "/" },
  { id: "upload-sample-link", label: "Upload sample", endpoint: "/upload-sample" },
  { id: "upload-used-uacs-link", label: "Upload used UACs", endpoint: "/upload-used-uacs" },
  { id: "disable-uac-link", label: "Disable UAC", endpoint: "/disable-uac" },
  { id: "enable-uac-link", label: "Enable UAC", endpoint: "/enable-uac" },
];

function AppContent({ loggedIn, user }: { loggedIn: boolean; user: User }): ReactElement {
  if (loggedIn && user) {
    return (
      <DefaultErrorBoundary>
        <Routes>
          <Route
            path="/upload-sample"
            element={<UploadSample />}
          />
          <Route
            path="/upload-used-uacs"
            element={<UploadUsedUacs />}
          />
          <Route
            path="/disable-uac"
            element={<DisableUac />}
          />
          <Route
            path="/enable-uac"
            element={<EnableUac />}
          />
          <Route
            path="/"
            element={<UploadedSamplesPage />}
          />
        </Routes>
      </DefaultErrorBoundary>
    );
  }

  return <></>;
}

function App(): ReactElement {
  const location = useLocation();
  const { sessionKey, cookieDomain } = getSharedAuthOptions();

  return (
    <Authenticate
      title="Blaise UAC Service"
      sessionKey={sessionKey}
      cookieDomain={cookieDomain}
    >
      {(user, loggedIn, logOutFunction) => (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <a
            href="#main-content"
            className="ons-skip-to-content ons-u-fs-r--b"
          >
            Skip to main content
          </a>
          {!isProduction(window.location.hostname) && <NotProductionWarning />}
          <Header
            title={"Blaise UAC Service"}
            signOutButton={loggedIn}
            noSave={true}
            signOutFunction={logOutFunction}
            navigationLinks={loggedIn ? navigationLinks : undefined}
            currentLocation={location.pathname}
            createNavLink={(id, label, endpoint) => (
              <Link
                id={id}
                to={endpoint}
                className="ons-navigation__link"
              >
                {label}
              </Link>
            )}
          />
          <div
            style={{ flexGrow: 1 }}
            className="ons-page__container ons-container"
          >
            <AppContent
              loggedIn={loggedIn}
              user={user}
            />
          </div>
          <Footer />
        </div>
      )}
    </Authenticate>
  );
}

export default App;
