import React, { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";
import { ONSLoadingPanel } from "blaise-design-system-react-components";
import ONSTable, { TableColumns } from "../InstrumentList/Sections/ONSTable";
import { Link } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";

interface UacChunks {
    uac1: string,
    uac2: string,
    uac3: string,
    uac4?: string,
}
interface UacInfo {
    instrument_name?: string,
    case_id?: string,
    disabled?: string,
    uac_chunks?: UacChunks,
    full_uac?: string,
}

interface DisabledUACList {
    questionnaireName: string;
    listOfDisabledUacs: UacInfo;
}
function EnableUac(): ReactElement {

    const [message, setMessage] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [listOfQuestionnairesWithDisabledUacs, setListOfQuestionnairesWithDisabledUacs] = useState<DisabledUACList[]>([]);

    function isObjectEmpty(obj: any): boolean {
        return obj && Object.entries(obj).length === 0 && obj.constructor === Object;
    }

    async function createNewList() {

        const arr: DisabledUACList[] = [];
        instruments.map(async (item) => {
            console.log("instruments loaded");
            try {
                const disabledUacs = await axios.get(`/api/v1/getDiabledUacs/${item}`, axiosConfig());

                const obj: DisabledUACList = {
                    questionnaireName: item,
                    listOfDisabledUacs: disabledUacs.data
                };
                arr.push(obj);

            }
            catch (error: unknown) {
                console.log("Response getting disabled uacs failed.");
                setErrored(true);
                setMessage("There was an error loading information for disabled UACs.");
                return [];
            }
        });
        setListOfQuestionnairesWithDisabledUacs(arr);
        console.log("List of New Items 1: " + JSON.stringify(listOfQuestionnairesWithDisabledUacs));
        // const filteredList = listOfQuestionnairesWithDisabledUacs.filter(obj => isObjectEmpty(obj.listOfDisabledUacs));
        // setListOfQuestionnairesWithDisabledUacs(filteredList);
        // console.log("List of New Items 2:" + JSON.stringify(filteredList));

    }

    useEffect(() => {
        let mounted = true;
        getInstrumentList().then(() => {
            if (mounted && instruments) {
                setListLoading(false);
                createNewList();
            }
        });

        return function cleanup() {
            mounted = false;
            setInstruments([]);
            setMessage("");
        };
    }, []);

    function instrumentTableRow(item: DisabledUACList, index: number) {

        return (
            <React.Fragment key={`row${index}`}>
                {/* {errored &&
                    <tr className="ons-table__row  ons-summary__item--error">
                        <th colSpan={6} className="ons-summary__row-title u-fs-r">{message}
                        </th>
                    </tr>
                } */}
                {item.listOfDisabledUacs !== null && <tr className={`ons-table__row ${(errored ? "ons-summary__item--error" : "")}`} key={index}
                    data-testid={"instrument-table-row"}>
                    <td className="ons-table__cell" style={{ padding: "1rem" }}>
                        {item.questionnaireName}
                    </td>
                    <td className="ons-table__cell">
                        <Link className="ons-breadcrumb__link" to={""} >Disabled UACs</Link>
                    </td>
                </tr>}
            </React.Fragment >
        );
    }

    async function getInstrumentList() {
        setListLoading(true);

        let questionnaires: Questionnaire[];
        try {
            const response = await axios.get("/api/questionnaires", axiosConfig());
            console.log(response.data);
            questionnaires = response.data;
            const arr: string[] = [];
            questionnaires.map(async (item) => {
                arr.push(item.name);
            });
            setInstruments(arr);

            console.log(`Response from get all questionnaires successful, data list length ${questionnaires.length}`);
        } catch (error: unknown) {
            console.log("Response from get all questionnaires failed");
            setErrored(true);
            setMessage("There was an error loading information for disabled UACs.");
            return [];
        }

        if (questionnaires.length === 0) {
            setMessage("No installed questionnaires found.");
        }

    }

    const tableColumns: TableColumns[] =
        [
            {
                title: "Questionnaire name"
            },
            {
                title: "Re-Enable UAC"
            },
        ];
    if (listLoading) {
        return <ONSLoadingPanel />;
    } else {
        return (
            <>
                <div className="ons-u-mt-s">
                    {
                        <ONSTable columns={tableColumns} tableID={"instrument-table"}>
                            {
                                listOfQuestionnairesWithDisabledUacs.map((item: DisabledUACList, index: number) => {
                                    return instrumentTableRow(item, index);
                                })
                            }
                        </ONSTable>
                    }

                </div>
            </>

        );
    }
}

export default EnableUac;
