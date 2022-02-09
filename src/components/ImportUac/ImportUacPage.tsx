import React, { ReactElement, useState } from "react";
import { Formik, Form } from "formik";
import { Link, Route, Switch } from "react-router-dom";
import App from "../../App";
import SelectFile from "./Sections/SelectFile";
import { ONSButton } from "blaise-design-system-react-components";
import { importUacsFromFile } from "../../client/file-functions";
import UploadFailed from "./Sections/UploadFailed";
import UploadSuccessful from "./Sections/UploadSuccessful";
import { AxiosError } from "axios";


enum Step {
  SelectFile,
  UploadFailed,
  UploadSuccessful
}

function ImportUacPage(): ReactElement {
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<Error | AxiosError>();
  const [uacsImported, setUacsImported] = useState<number>();
  const [activeStep, setActiveStep] = useState(Step.SelectFile);

  function _renderStepContent(step: number) {
    switch (step) {
      case Step.SelectFile:
        return (<SelectFile file={file} setFile={setFile}/>);
      case Step.UploadFailed:
        return (<UploadFailed error={error} />);
      case Step.UploadSuccessful:
        return (<UploadSuccessful uacsImported={uacsImported} />);
    }
  }

  async function _handleSubmit() {
    switch (activeStep) {
      case Step.SelectFile: {
        await importUacsFromFile(file).then((uacsImported: number) => {
          setUacsImported(uacsImported);
          setActiveStep(Step.UploadSuccessful);
        }).catch((error: Error) => {
          setError(error);
          setActiveStep(Step.UploadFailed);
        });
        break;
      }
      default:
        setActiveStep(Step.SelectFile);
    }
  }

  return (
    <>
      <main id="main-content" className="page__main u-mt-no">
        <Switch>
          <Route path="/app">
            <App />
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
          initialValues={{  }}
          onSubmit={_handleSubmit}>
          {({ isSubmitting }) => (
            <Form id={"formID"}>
              <div>
                <div className="u-mt-m">
                  {_renderStepContent(activeStep)}
                </div>
                <div className="btn-group u-mt-m">
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

export default ImportUacPage;
