import React, { ReactElement, useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "react-router-dom";
import UploadSamplePage from "./components/UploadSample/UploadSamplePage";
import ImportUacPage from "./components/ImportUac/ImportUacPage";
import { Footer, Header, BetaBanner, DefaultErrorBoundary, NotProductionWarning, ONSLoadingPanel } from "blaise-design-system-react-components";
import "./style.css";
import QuestionnaireListPage from "./components/QuestionnaireList/QuestionnaireListPage";
import { LoginForm, AuthManager } from "blaise-login-react-client";
import { isProduction } from "./client/env";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {
    const authManager = new AuthManager();
    const location = useLocation();
    const [loaded, setLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        console.log(location);
        authManager.loggedIn().then(async (isLoggedIn: boolean) => {
            setLoggedIn(isLoggedIn);
            setLoaded(true);
        });
    });

    function LoginPage(): ReactElement {
        if (loaded && loggedIn) {
            return <></>;
        }
        return <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />;
    }

    function signOut(): void {
        authManager.clearToken();
        setLoggedIn(false);
    }

    function Loading(): ReactElement {
        if (loaded) {
            return <></>;
        }
        return <ONSLoadingPanel />;
    }

    function AppContent(): ReactElement {
        if (loaded && loggedIn) {
            return (
                <DefaultErrorBoundary>
                    <Switch>
                        <Route path="/upload">
                            <UploadSamplePage />
                        </Route>
                        <Route path="/import">
                            <ImportUacPage />
                        </Route>
                        <Route path="/">
                            <ul className="list list--bare list--inline u-mt-m">
                                <li className="list__item">
                                    <Link to="/upload" id="upload-sample-link">
                                        Upload sample
                                    </Link>
                                </li>
                                <li className="list__item">
                                    <Link to="/import" id="import-uacs-link">
                                        Upload used UACs
                                    </Link>
                                </li>
                            </ul>
                            <h2 className="u-mt-m">Previously uploaded questionnaire samples</h2>
                            <QuestionnaireListPage />
                        </Route>
                    </Switch>
                </DefaultErrorBoundary>
            );
        }
        return <></>;
    }

    return (
        <>
            <a className="skip__link" href="#main-content">Skip to main content</a>
            {
                isProduction(window.location.hostname) ? <></> : <NotProductionWarning />
            }
            <BetaBanner />
            <Header title={"Generate UACs"} signOutButton={loggedIn} noSave={true} signOutFunction={signOut} />
            <div style={divStyle} className="page__container container">
                <Loading />
                <LoginPage />
                <AppContent />
            </div>
            <Footer />
        </>
    );
}

export default App;
