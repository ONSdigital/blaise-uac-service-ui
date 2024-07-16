import React, { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";
import { ONSButton, ONSLoadingPanel } from "blaise-design-system-react-components";
import ONSTable, { TableColumns } from "../InstrumentList/Sections/ONSTable";
import { useNavigate } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";

interface UacInfo {
    case_id: string,
    uac: string,
}

export interface QuestionnaireWithDisabledUacs {
    questionnaireName: string;
    disabledUacs: UacInfo[];
}

function QuestionnaireListWithDisabledUacs(): ReactElement {

    const navigate = useNavigate();
    const [message, setMessage] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [listOfQuestionnairesWithDisabledUacs, setListOfQuestionnairesWithDisabledUacs] = useState<QuestionnaireWithDisabledUacs[]>([]);

    async function createNewList(instruments: string[]) {
        console.log("Filtering questionnaires that have got disabled uacs");
        const arr: QuestionnaireWithDisabledUacs[] = [];
        instruments.map(async (item) => {
            try {
                const disabledUacs = await axios.get(`/api/v1/getDiabledUacs/${item}`, axiosConfig());

                const apiResponse = disabledUacs.data;
                const disabledUacList: UacInfo[] = [];

                for (const key in apiResponse) {
                    if (Object.prototype.hasOwnProperty.call(apiResponse, key)) {
                        const item = apiResponse[key];
                        const { case_id, full_uac } = item;

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
                    setListOfQuestionnairesWithDisabledUacs(arr);
                    setListLoading(false);
                }
            }
            catch (error: unknown) {
                console.log("Response getting disabled uacs failed.");
                setErrored(true);
                setMessage("There was an error loading information for disabled UACs.");
                return [];
            }

        });
        console.log("Final List preped: " + JSON.stringify(listOfQuestionnairesWithDisabledUacs));

    }

    useEffect(() => {
        const mounted = true;
        getInstrumentList().then(() => {
            if (mounted && instruments) {
                console.info("Loaded all the installed questionnaires");
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
                        <ONSButton
                            label="View Disabled Cases"
                            small={true}
                            onClick={() => navigate("/listDisabledUacs", { state: { questionnaireWithDisabledUacs: item } })} primary={true} />
                    </td>
                </tr>
            </React.Fragment >
        );
    }

    async function getInstrumentList() {
        setListLoading(true);

        let questionnaires: Questionnaire[];
        try {
            const response = await axios.get("/api/v1/questionnaires", axiosConfig());
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
                        listOfQuestionnairesWithDisabledUacs.length && <ONSTable columns={tableColumns} tableID={"instrument-table"}>
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

export default QuestionnaireListWithDisabledUacs;
