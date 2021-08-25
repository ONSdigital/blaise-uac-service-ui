import React, {ReactElement, useState} from "react";
import {Formik, Form} from "formik";
import {Link, Route, Switch} from "react-router-dom";
import App from "../../App";
import SelectFile from "./Sections/SelectFile";
import InstrumentName from "./Sections/InstrumentName";
import {ONSButton} from "blaise-design-system-react-components";
import {sampleFileAlreadyExists, generateUacCodesForSampleFile} from "../../client/file-functions";
import UploadFailed from "./Sections/UploadFailed";
import FileExists from "./Sections/FileExists";
import DownloadUacFile from "./Sections/DownloadUacFile";
import {Datas} from "react-csv-downloader/dist/esm/lib/csv";

function UploadSamplePage(): ReactElement {
    const [instrumentName, setInstrumentName] = useState<string>();
    const [overwrite, setOverwrite] = useState<string>();
    const [file, setFile] = useState<File>();
    const [activeStep, setActiveStep] = useState(0);
    const [downloadData, setDownloadData] = useState<Datas>([]);


    function _renderStepContent(step: number) {
        switch (step) {
            case 0:
                return (<InstrumentName instrumentName={instrumentName} setInstrumentName={setInstrumentName}/>);
            case 1:
                return (
                    <FileExists instrumentName={instrumentName} overwrite={overwrite} setOverwrite={setOverwrite}/>);
            case 2:
                return (<SelectFile file={file} setFile={setFile}/>);
            case 3:
                return (<DownloadUacFile instrumentName={instrumentName} downloadData={downloadData}/>);
            case 4:
                return (<UploadFailed instrumentName={instrumentName}/>);
        }
    }

    async function generateUacCodesAndSetDownloadData(): Promise<boolean> {
        const result = await generateUacCodesForSampleFile(instrumentName, file);
        setDownloadData(result);
        return result.length > 0;
    }

    async function _handleSubmit() {
        switch (activeStep) {
            case 0:
                setActiveStep(await sampleFileAlreadyExists(instrumentName) ? 1 : 2);
                break;
            case 1:
                setActiveStep(overwrite === "Yes" ? 2 : 3);
                break;
            case 2:
                setActiveStep(await generateUacCodesAndSetDownloadData() ? 3 : 4);
                break;
            default:
                setActiveStep(0);
        }
    }

    return (
        <>
            <main id="main-content" className="page__main u-mt-no">
                <Switch>
                    <Route path="/app">
                        <App/>
                    </Route>
                    <Route path="/">

                        <ul className="list list--bare list--inline u-mt-m">
                            <li className="list__item">
                                <Link to="/app" id="generate-uac-link">
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
                            <div className="u-mt-m">
                                {_renderStepContent(activeStep)}
                            </div>
                            <div className="btn-group u-mt-m">
                                <ONSButton
                                    id={"next-screen-button"}
                                    submit={true}
                                    primary={true} label={"Continue"}/>
                            </div>
                        </div>
                    </Form>

                </Formik>
            </main>
        </>
    );
}

export default UploadSamplePage;
