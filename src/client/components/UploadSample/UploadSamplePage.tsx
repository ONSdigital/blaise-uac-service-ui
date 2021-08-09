import React, {ReactElement, useState} from "react";
import {Formik, Form} from "formik";
import {Link, Route, Switch} from "react-router-dom";
import App from "../../../App";
import SelectFile from "./Sections/SelectFile";
import InstrumentName from "./Sections/InstrumentName";
import {ONSPanel, ONSButton, StyledFormErrorSummary} from "blaise-design-system-react-components";
import {uploadFile} from "../../upload-file";
import UploadFailed from "./Sections/UploadFailed";
import UploadSuccessful from "./Sections/UploadSuccessful";

function UploadSamplePage(): ReactElement {
    const [instrumentName, setInstrumentName] = useState<string>();
    const [file, setFile] = useState<File>();
    const [activeStep, setActiveStep] = useState(0);

    function _renderStepContent(step: number) {
        switch (step) {
            case 1:
                return (
                    <UploadSuccessful instrumentName={instrumentName}/>
                );
            case 2:
                return (
                    <UploadFailed instrumentName={instrumentName}/>
                );
        }
    }

    async function _handleSubmit() {
        const result = await uploadFile(instrumentName, file);
        if(result === true) {
            setActiveStep(1);
        }
        else {
            setActiveStep(2);
        }
    }

    return (
        <>
            {/*<Breadcrumbs BreadcrumbList={*/}
            {/*    [*/}
            {/*        {link: "/", title: "Home"},*/}
            {/*    ]*/}
            {/*}/>*/}

            <main id="main-content" className="page__main u-mt-no">
                <Switch>
                    <Route path="/app">
                        <App/>
                    </Route>
                    <Route path="/">

                        <ul className="list list--bare list--inline u-mt-m">
                            <li className="list__item">
                                <Link to="/app" id="deploy-questionnaire-link">
                                    Home
                                </Link>
                            </li>
                        </ul>
                    </Route>
                </Switch>

                <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                    initialValues={{override: ""}}
                    onSubmit={_handleSubmit}>

                    <Form id={"formID"}>
                        <div>
                            <h1 className="u-mt-s">
                                Select instrument sample
                            </h1>

                            <ONSPanel>
                                <p>
                                    When a sample file is selected and you continue to upload this sample file, <b>this
                                    may take a few minutes</b>.
                                    <br/>
                                    <br/>
                                    Given this, <b>do not navigate away</b> from this page during this process. You will
                                    be
                                    re-directed
                                    when there is an update regarding the deploy of the questionnaire.
                                </p>
                            </ONSPanel>
                        </div>
                        <div className="u-mt-m">
                            <StyledFormErrorSummary/>
                            <InstrumentName
                                instrumentName={instrumentName}
                                setInstrumentName={setInstrumentName}/>
                            <SelectFile
                                file={file}
                                setFile={setFile}
                                loading={false}/>
                        </div>
                        {_renderStepContent(activeStep)}
                        <div className="btn-group u-mt-m">
                            <ONSButton
                                id={"upload-sample-button"}
                                submit={true}
                                primary={true} label={"Continue"}/>
                        </div>
                    </Form>

                </Formik>
            </main>
        </>
    );
}

export default UploadSamplePage;
