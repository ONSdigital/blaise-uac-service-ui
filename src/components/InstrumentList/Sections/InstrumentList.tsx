import React, {ReactElement, useState} from "react";
import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import ONSTable, {TableColumns} from "./ONSTable";
import CsvDownloader from "react-csv-downloader";
import {getSampleFileWithUacCodes} from "../../../client/file-functions";
import {ONSButton} from "blaise-design-system-react-components";

interface Props {
    instrumentList: string[];
    loading: boolean;
    message: string;
}

export const InstrumentList = (props: Props): ReactElement => {
    const {instrumentList, loading, message} = props;
    const displayTable = instrumentList.length > 0;
    const tableColumns: TableColumns[] =
        [
            {
                title: "Instrument name"
            },
            {
                title: "CSV file"
            },
        ];

    if (loading) {
        return <ONSLoadingPanel/>;
    } else {
        return (
            <>
                <div className="u-mt-s">
                    {
                        displayTable ?
                            <ONSTable columns={tableColumns} tableID={"instrument-table"}>
                                {
                                    instrumentList.map((item: string) => {
                                        return instrumentTableRow(item);
                                    })
                                }
                            </ONSTable>
                            :
                            <ONSPanel spacious={true}
                                      status={message.includes("Unable") ? "error" : "info"}>{message}</ONSPanel>
                    }

                </div>
            </>

        );
    }
};
export default InstrumentList;


function instrumentTableRow(item: string) {
    const [errored, setErrored] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const downloadCsvFile = async () => {
        setLoading(true);
        return getSampleFileWithUacCodes(item, `${item}.csv`)
            .then((response) => {
                return response;
            })
            .catch(() => {
                setErrored(true);
                return Promise.reject("");
            }).finally(() => setLoading(false));
    };

    return (
        <>
            {errored &&
            <tr className="table__row  summary__item--error">
                <th colSpan={6} className="summary__row-title u-fs-r">There was an error downloading the file {item}.csv
                </th>
            </tr>
            }
            <tr className={`table__row ${(errored ? "summary__item--error" : "")}`}
                key={item}
                data-testid={"instrument-table-row"}>
                <td className="table__cell" style={{padding: "1rem"}}>
                    {item}
                </td>
                <td className="table__cell">
                    <CsvDownloader datas={downloadCsvFile} filename={`${item}.csv`}>
                        <ONSButton label={"Download"} primary={true} small={true} loading={loading}/>
                    </CsvDownloader>
                </td>
            </tr>
        </>
    );
}