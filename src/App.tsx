import React, { ReactElement, } from "react";
import { Routes, Route, Link } from "react-router-dom";
import UploadSamplePage from "./components/UploadSample/UploadSamplePage";
import ImportUacPage from "./components/ImportUac/ImportUacPage";
import { Footer, Header, DefaultErrorBoundary, NotProductionWarning } from "blaise-design-system-react-components";
import "./style.css";
import InstrumentListPage from "./components/InstrumentList/InstrumentListPage";
import { isProduction } from "./client/env";
import { User } from "blaise-api-node-client";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import ManageUacPage from "./components/ManageUac/ManageUacPage";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {

    function AppContent({ loggedIn, user }: { loggedIn: boolean, user: User }): ReactElement {
        if (loggedIn && user) {
            return (
                <DefaultErrorBoundary>
                    <Routes>
                        <Route path="/upload" element={<UploadSamplePage />} />
                        <Route path="/import" element={<ImportUacPage />} />
                        <Route path="/manageUac/:action" element={<ManageUacPage />} />
                        <Route path="/app" element={<AppContent loggedIn={loggedIn} user={user} />} />
                        <Route path="/" element={
                            <>
                                <ul className="ons-list ons-list--bare ons-list--inline ons-u-mt-m">
                                    <li className="ons-list__item">
                                        <Link to="/upload" id="upload-sample-link">
                                            Upload sample
                                        </Link>
                                    </li>
                                    <li className="ons-list__item">
                                        <Link to="/import" id="import-uacs-link">
                                            Upload used UACs
                                        </Link>
                                    </li>
                                    <li className="ons-list__item">
                                        <Link to="/manageUac/disable" id="manage-uacs-link">
                                            Disable UAC
                                        </Link>
                                    </li>
                                    <li className="ons-list__item">
                                        <Link to="/manageUac/enable" id="manage-uacs-link">
                                            Enable UAC
                                        </Link>
                                    </li>
                                </ul>
                                <h2 className="ons-u-mt-m">Previously uploaded questionnaire samples</h2>
                                <InstrumentListPage />
                            </>
                        }>
                        </Route>
                    </Routes>
                </DefaultErrorBoundary>
            );
        }
        return <></>;
    }

    return (
        <Authenticate title="Blaise UAC Service">
            {(user, loggedIn, logOutFunction) => (
                <>
                    <a className="ons-skip-link" href="#main-content">Skip to main content</a>
                    {
                        isProduction(window.location.hostname) ? <></> : <NotProductionWarning />
                    }
                    <Header title={"Generate UACs"} signOutButton={loggedIn} noSave={true} signOutFunction={logOutFunction} />
                    <div style={divStyle} className="ons-page__container ons-container">
                        <AppContent loggedIn={loggedIn} user={user} />
                    </div>
                    <Footer />
                </>
            )}
        </Authenticate>
    );
}

export default App;
