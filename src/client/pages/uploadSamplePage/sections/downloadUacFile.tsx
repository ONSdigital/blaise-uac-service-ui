import { Button, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import CsvDownloader from "react-csv-downloader";

import useSampleFileDownload from "../../shared/useSampleFileDownload";

interface DownloadUacPageProps {
  questionnaireName: string | undefined;
}

function DownloadUacFile(props: DownloadUacPageProps): ReactElement {
  const { questionnaireName } = props;
  const { loading, errored, downloadCsvFile } = useSampleFileDownload(questionnaireName);

  return (
    <>
      {errored && (
        <Panel status="error">
          <p>Could not download {questionnaireName}.csv</p>
        </Panel>
      )}
      <Panel
        status="success"
        bigIcon={true}
      >
        <h1>UACs generated for {questionnaireName}</h1>
        <p>
          You can download the sample file with generated UACs appended from here or the home
          screen.
        </p>
        <CsvDownloader
          datas={downloadCsvFile}
          filename={`${questionnaireName}.csv`}
          bom={false}
        >
          <Button
            label={"Download"}
            primary={false}
            small={true}
            loading={loading}
          />
        </CsvDownloader>
      </Panel>
    </>
  );
}

export default DownloadUacFile;
