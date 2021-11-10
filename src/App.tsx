import React, { ReactElement} from "react";
import { Switch, Route, Link } from "react-router-dom";
import UploadSamplePage from "./components/UploadSample/UploadSamplePage";
import ImportUacPage from "./components/ImportUac/ImportUacPage";
import {Footer, Header, BetaBanner, NotProductionWarning} from "blaise-design-system-react-components";
import "./style.css";
import InstrumentListPage from "./components/InstrumentList/InstrumentListPage";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {

    return (
        <>
            {
                (window.location.hostname.includes("dev")) && <NotProductionWarning/>
            }
            <BetaBanner/>
            <Header title={"Generate UACs"}/>
            <div style={divStyle} className="page__container container">
                <main id="main-content" className="page__main">
                    <Switch>
                        <Route path="/upload">
                            <UploadSamplePage/>
                        </Route>
                        <Route path="/import">
                            <ImportUacPage/>
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
                            <InstrumentListPage />
                        </Route>
                    </Switch>
                </main>
            </div>
            <Footer/>
        </>
    );
}

export default App;
