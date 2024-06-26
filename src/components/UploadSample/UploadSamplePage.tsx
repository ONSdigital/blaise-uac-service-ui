import React, { ReactElement, useState } from "react";
import { Formik, Form } from "formik";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import App from "../../App";
import SelectFile from "./Sections/SelectFile";
import InstrumentName from "./Sections/InstrumentName";
import { ONSButton } from "blaise-design-system-react-components";
import { sampleFileAlreadyExists, generateUacCodesForSampleFile } from "../../client/file-functions";
import UploadFailed from "./Sections/UploadFailed";
import FileExists from "./Sections/FileExists";
import DownloadUacFile from "./Sections/DownloadUacFile";
import ConfirmName from "./Sections/ConfirmName";
import { AxiosError } from "axios";

enum Step {
    InstrumentName,
    ConfirmName,
    AlreadyExists,
    SelectFile,
    DownloadFile,
    UploadFailed
}

function UploadSamplePage(): ReactElement {
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [nameConfirmation, setNameConfirmation] = useState<boolean>(false);
    const [overwrite, setOverwrite] = useState<string>();
    const [file, setFile] = useState<File>();
    const [activeStep, setActiveStep] = useState<Step>(Step.InstrumentName);
    const [error, setError] = useState<Error | AxiosError>();

    const navigate = useNavigate();

    function _renderStepContent(step: number) {
        switch (step) {
        case Step.InstrumentName:
            return (<InstrumentName instrumentName={instrumentName} setInstrumentName={setInstrumentName} />);
        case Step.ConfirmName:
            return (<ConfirmName instrumentName={instrumentName} setNameConfirmation={setNameConfirmation} />);
        case Step.AlreadyExists:
            return (
                <FileExists instrumentName={instrumentName} overwrite={overwrite} setOverwrite={setOverwrite} />);
        case Step.SelectFile:
            return (<SelectFile file={file} setFile={setFile} />);
        case Step.DownloadFile:
            return (<DownloadUacFile instrumentName={instrumentName} />);
        case Step.UploadFailed:
            return (<UploadFailed instrumentName={instrumentName} error={error} />);
        }
    }

    async function _handleSubmit() {
        switch (activeStep) {
        case Step.InstrumentName:
            setActiveStep(Step.ConfirmName);
            break;
        case Step.ConfirmName:
            console.log(nameConfirmation);
            if (nameConfirmation) {
                setActiveStep(await sampleFileAlreadyExists(instrumentName) ? Step.AlreadyExists : Step.SelectFile);
                break;
            }
            setActiveStep(Step.InstrumentName);
            break;
        case Step.AlreadyExists:
            setActiveStep(overwrite === "Yes" ? Step.SelectFile : Step.DownloadFile);
            break;
        case Step.SelectFile:
            try {
                await generateUacCodesForSampleFile(instrumentName, file);
                setActiveStep(Step.DownloadFile);
            } catch (error) {
                setError(error as Error);
                setActiveStep(Step.UploadFailed);
            }
            break;
        case Step.DownloadFile:
            navigate("/");
            break;
        default:
            setActiveStep(Step.InstrumentName);
        }
    }

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <Routes>
                    <Route path="/app" element={<App />} />
                    <Route path="/" element={
                        <ul className="ons-list ons-list--bare ons-list--inline ons-u-mt-m">
                            <li className="ons-list__item">
                                <Link to="/app" id="generate-uac-link">
                                    Home
                                </Link>
                            </li>
                        </ul>
                    } />
                </Routes>

                <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                    initialValues={{ override: "" }}
                    onSubmit={_handleSubmit}>
                    {({ isSubmitting }) => (
                        <Form id={"formID"}>
                            <div>
                                <div className="ons-u-mt-m">
                                    {_renderStepContent(activeStep)}
                                </div>
                                <div className="ons-btn-group ons-u-mt-m">
                                    <ONSButton
                                        id={"next-screen-button"}
                                        submit={true}
                                        loading={isSubmitting}
                                        primary={true}
                                        label={"Continue"}
                                        onClick={(e) => e.currentTarget.blur()} /></div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </main>
        </>
    );
}

export default UploadSamplePage;
