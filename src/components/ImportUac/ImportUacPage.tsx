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

function ImportUacPage(): ReactElement {
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<Error | AxiosError>();
  const [uacsImported, setUacsImported] = useState<number>();
  const [activeStep, setActiveStep] = useState(0);

  function _renderStepContent(step: number) {
    switch (step) {
      case 0:
        return (<SelectFile file={file} setFile={setFile}/>);
      case 1:
        return (<UploadFailed error={error} />);
      case 2:
        return (<UploadSuccessful uacsImported={uacsImported} />);
    }
  }

  async function _handleSubmit() {
    switch (activeStep) {
      case 0: {
        await importUacsFromFile(file).then((uacsImported: number) => {
          setUacsImported(uacsImported);
          setActiveStep(2);
        }).catch((error: Error) => {
          setError(error);
          setActiveStep(1);
        });
        break;
      }
      default:
        setActiveStep(0);
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
