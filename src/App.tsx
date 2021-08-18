import React, {ReactElement} from "react";
import {Switch, Route, Link} from "react-router-dom";
import UploadSamplePage from "./client/components/UploadSample/UploadSamplePage";
import {Footer, Header, BetaBanner, ONSPanel, NotProductionWarning } from "blaise-design-system-react-components";
import {getInstrumentsWithExistingUacCodes} from "./client/uac-functions";
import "./style.css";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {

    async function getInstrumentsWithExistingUacCodes() {
        await getInstrumentsWithExistingUacCodes();
    }

    return (
        <>
            {
                (window.location.hostname.includes("dev")) && <NotProductionWarning/>
            }
            <BetaBanner/>
            <Header title={"Create UACs for case samples"}/>
            <div style={divStyle} className="page__container container">
                <main id="main-content" className="page__main">
                    <Switch>
                        <Route path="/upload">
                            <UploadSamplePage/>
                        </Route>
                        <Route path="/">

                            <ul className="list list--bare list--inline u-mt-m">
                                <li className="list__item">
                                    <Link to="/upload" id="deploy-questionnaire-link">
                                        Upload sample
                                    </Link>
                                </li>
                            </ul>

                            <ONSPanel>
                                <p>
                                    This is a landing page. Construction is on hold until we have finished the <Link
                                    to="/upload" id="deploy-questionnaire-link">upload sample</Link> page. Leave us
                                    alone until then!
                                </p>
                            </ONSPanel>
                        </Route>
                    </Switch>
                </main>
            </div>
            <Footer/>
        </>
    );
}

export default App;
