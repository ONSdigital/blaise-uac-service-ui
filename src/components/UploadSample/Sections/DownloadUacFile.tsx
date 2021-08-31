import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement, useState} from "react";
import CsvDownloader from "react-csv-downloader";
import {getSampleFileWithUacCodes} from "../../../client/file-functions";

interface DownloadUacPageProps {
    instrumentName: string | undefined
}

function DownloadUacFile(props: DownloadUacPageProps): ReactElement {
    const {instrumentName} = props;
    const [errored, setErrored] = useState<boolean>();

    const downloadCsvFile = async () => {

        return getSampleFileWithUacCodes(instrumentName, `${instrumentName}.csv`)
            .then((response) => {
                return response;
            })
            .catch(() => {
                setErrored(true);
                return Promise.reject("");
            });
    };

    return (
        <>
            {errored &&
            <ONSPanel status="error">
                <p>There was an error downloading the file {instrumentName}.csv</p>
            </ONSPanel>
            }
            <ONSPanel status="success" bigIcon={true}>
                <h1>
                    Successfully generated UACs for {instrumentName}
                </h1>
                <p>
                    Download CSV file
                </p>
                <CsvDownloader datas={downloadCsvFile} filename={`${instrumentName}.csv`}>
                    <ONSButton label={"Download"} primary={false} small={true}/>
                </CsvDownloader>
            </ONSPanel>
        </>
    );
}

export default DownloadUacFile;