import React, { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";
import { ONSLoadingPanel } from "blaise-design-system-react-components";
import ONSTable, { TableColumns } from "../InstrumentList/Sections/ONSTable";
import { Link } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";

interface UacInfo {
    case_id: string,
    uac: string,
}

interface QuestionnaireWithDisabledUacs {
    questionnaireName: string;
    disabledUacs: UacInfo[];

}
function EnableUac(): ReactElement {

    const [message, setMessage] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [listOfQuestionnairesWithDisabledUacs, setListOfQuestionnairesWithDisabledUacs] = useState<QuestionnaireWithDisabledUacs[]>([]);

    async function createNewList(instruments: string[]) {

        const arr: QuestionnaireWithDisabledUacs[] = [];
        instruments.map(async (item) => {
            console.log("filtering instruments started");
            try {
                const disabledUacs = await axios.get(`/api/v1/getDiabledUacs/${item}`, axiosConfig());
                console.log(disabledUacs.data);
                const apiResponse = disabledUacs.data;
                const disabledUacList: UacInfo[] = [];
                for (const key in apiResponse) {
                    console.log(key);
                    if (Object.prototype.hasOwnProperty.call(apiResponse, key)) {
                        const item = apiResponse[key];
                        const { case_id, full_uac } = item;

                        console.log(`Case ID: ${case_id}`);
                        console.log(`Full UAC: ${full_uac}`);
                        const obj: UacInfo = {
                            case_id: case_id,
                            uac: full_uac
                        };
                        disabledUacList.push(obj);
                    }
                }
                if (disabledUacList.length > 0) {
                    const questionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs = {
                        questionnaireName: item,
                        disabledUacs: disabledUacList
                    };
                    arr.push(questionnaireWithDisabledUacs);
                }
            }
            catch (error: unknown) {
                console.log("Response getting disabled uacs failed.");
                setErrored(true);
                setMessage("There was an error loading information for disabled UACs.");
                return [];
            }

            setListOfQuestionnairesWithDisabledUacs(arr);
            console.log("Final List preped: " + JSON.stringify(listOfQuestionnairesWithDisabledUacs));
            setListLoading(false);
        });
        console.log(message);
        return arr;

    }

    useEffect(() => {
        const mounted = true;
        getInstrumentList().then(() => {
            if (mounted) {
                //setListLoading(false);
            }
        });
    }, []);

    useEffect(() => {
        if (instruments) {
            createNewList(instruments);
        }
    }, [listLoading, instruments]);

    function instrumentTableRow(item: QuestionnaireWithDisabledUacs, index: number) {
        const { questionnaireName } = item;
        return (
            <React.Fragment key={`row${index}`}>
                {errored &&
                    <tr className="ons-table__row  ons-summary__item--error">
                        <th colSpan={6} className="ons-summary__row-title u-fs-r">{message}
                        </th>
                    </tr>
                }
                <tr className={`ons-table__row ${(errored ? "ons-summary__item--error" : "")}`} key={index}
                    data-testid={"instrument-table-row"}>
                    <td className="ons-table__cell" style={{ padding: "1rem" }}>
                        {questionnaireName}
                    </td>
                    <td className="ons-table__cell">
                        <Link className="ons-breadcrumb__link" to={""} >Disabled UACs</Link>
                    </td>
                </tr>
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
                title: "Disabled UACs"
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
                                listOfQuestionnairesWithDisabledUacs.map((item: QuestionnaireWithDisabledUacs, index: number) => {
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
