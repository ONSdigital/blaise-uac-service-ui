import { Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface UploadSuccessfulPageProps {
  uacsImported: number | undefined;
}

function UploadSuccessful({ uacsImported }: UploadSuccessfulPageProps): ReactElement {
  return (
    <>
      <Panel
        status="success"
        bigIcon={true}
      >
        <h1>Upload complete</h1>
        <p>{uacsImported ?? 0} UACs imported</p>
      </Panel>
    </>
  );
}

export default UploadSuccessful;
