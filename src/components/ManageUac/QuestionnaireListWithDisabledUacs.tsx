import React, { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import axiosConfig from "../../client/axiosConfig";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import ONSTable, { TableColumns } from "../InstrumentList/Sections/ONSTable";
import { useNavigate } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";
import { QuestionnaireWithDisabledUacs, UacInfo } from "../../models/model";

function QuestionnaireListWithDisabledUacs(): ReactElement {

    const navigate = useNavigate();
    const [message, setMessage] = useState<string>("");
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [listOfQuestionnairesWithDisabledUacs, setListOfQuestionnairesWithDisabledUacs] = useState<QuestionnaireWithDisabledUacs[]>([]);

    useEffect(() => {
        getInstrumentList().then(async (questionnaireNames) => {
            console.info("Loaded all the installed questionnaires");
            if (questionnaireNames.length > 0) {
                const finalArray = await getFilteredList(questionnaireNames);
                if (finalArray.length > 0)
                    setListOfQuestionnairesWithDisabledUacs(finalArray);
                else
                    setMessage("There are no disabled codes.");
            }
            setListLoading(false);
            return;
        }).catch((error: unknown) => {
            console.log(`Failed to get questionnaires ${error}`);
            setErrored(true);
            setMessage("There are no disabled uacs");
            setListLoading(false);
            return;
        });

    }, []);

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
            questionnaires = response.data;
            const arr: string[] = [];
            questionnaires.map(async (item) => {
                arr.push(item.name);
            });
            return arr;
        } catch (error: unknown) {
            console.log("Response from get all questionnaires failed");
            setErrored(true);
            setMessage("There was an error loading information for disabled UACs.");
            setListLoading(false);
            return [];
        }
    }

    async function getFilteredList(questionnaireNames: string[]) {
        setListLoading(true);
        let arr: QuestionnaireWithDisabledUacs[] = [];
        let results;
        try {
            const promises = questionnaireNames.map(async (instrumentName) => {
                const response = await axios.get(`/api/v1/getDiabledUacs/${instrumentName}`, axiosConfig());
                if (!response.data) {
                    throw new Error(`Getting disabled uacs failed for instrument ${instrumentName}`);
                }
                return response.data;
            });

            results = await Promise.all(promises);
            console.log("Results: " + JSON.stringify(results));

        } catch (error) {
            console.error("Error fetching data:", error);
            setErrored(true);
            setMessage("Some error occured while fetching disabled uacs. ");
            return [];
        }

        arr = results?.map(result => {
            const disabledUacList: UacInfo[] = [];
            let instrumentName = "";
            for (const key in result) {
                if (Object.prototype.hasOwnProperty.call(result, key)) {
                    const item = result[key];
                    const { case_id, full_uac, instrument_name } = item;
                    instrumentName = instrument_name;
                    const obj: UacInfo = {
                        case_id: case_id,
                        uac: full_uac
                    };
                    disabledUacList.push(obj);
                }
            }
            if (disabledUacList.length > 0) {
                const questionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs = {
                    questionnaireName: instrumentName,
                    disabledUacs: disabledUacList
                };
                return questionnaireWithDisabledUacs;

            }
            else
                return {} as QuestionnaireWithDisabledUacs;
        });

        const newArr: QuestionnaireWithDisabledUacs[] = [];
        for (let i = 0; i < arr.length; i++) {
            if ((Object.keys(arr[i]).length !== 0)) {
                newArr.push(arr[i]);
            }
        }
        console.log("Final List preped: " + JSON.stringify(newArr));
        return newArr;

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
    }
    else {
        return (
            listOfQuestionnairesWithDisabledUacs &&
            < ONSTable columns={tableColumns} tableID={"instrument-table"}>
                {
                    listOfQuestionnairesWithDisabledUacs.map((item: QuestionnaireWithDisabledUacs, index: number) => {
                        return instrumentTableRow(item, index);
                    })
                }
            </ONSTable>);
    }
    return (
        <ONSPanel spacious={true} status={message.includes("Unable") ? "error" : "info"}>{message}</ONSPanel>

    );

}

export default QuestionnaireListWithDisabledUacs;
