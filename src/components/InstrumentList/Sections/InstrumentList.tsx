import React, {ReactElement} from "react";
import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import ONSTable, {TableColumns} from "./ONSTable";
import {Link} from "react-router-dom";

interface Props {
    instrumentList: string[]
    loading: boolean
    listMessage: string
}

function instrumentTableRow(item: string) {
    return (
        <tr className="table__row" key={item} data-testid={"instrument-table-row"}>
            <td className="table__cell ">
                {item}
            </td>
            <td className="table__cell ">
                <Link
                    id={`info-${item}`}
                    data-testid={`info-${item}`}
                    aria-label={`View more information for questionnaire ${item}`}
                    to={{
                        pathname: "/questionnaire",
                        state: {instrument: item}
                    }}>
                    Click to download
                </Link>
            </td>
        </tr>
    );
}

export const InstrumentList = (props: Props): ReactElement => {
    const {instrumentList, loading, listMessage} = props;

    const tableColumns: TableColumns[] =
        [
            {
                title: "Name"
            },
            {
                title: "UAC file"
            },
        ];


    if (loading) {
        return <ONSLoadingPanel/>;
    } else {
        return (
            <>
                <div className="u-mt-s">

                    {
                        instrumentList.length > 0 ?
                            <ONSTable columns={tableColumns} tableID={"instrument-table"}>
                                {
                                    instrumentList.map((item: string) => {
                                        return instrumentTableRow(item);
                                    })
                                }
                            </ONSTable>
                            :
                            <ONSPanel spacious={true}
                                      status={listMessage.includes("Unable") ? "error" : "info"}>{listMessage}</ONSPanel>
                    }

                </div>
            </>

        );
    }
};

export default InstrumentList;
