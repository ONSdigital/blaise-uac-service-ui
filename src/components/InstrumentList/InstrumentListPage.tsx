import React, { ReactElement, useState, useEffect } from "react";
import { getListOfInstrumentsWhichHaveExistingSampleFiles } from "./../../client/file-functions";
import QuestionnaireList from "./Sections/QuestionnaireList";
import { ONSPanel } from "blaise-design-system-react-components";

function InstrumentListPage(): ReactElement {
    const [message, setMessage] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;
        getInstrumentList().then(() => {
            if (mounted) {
                setListLoading(false);
            }
        });

        return function cleanup() {
            mounted = false;
            setInstruments([]);
            setMessage("");
        };
    }, []);

    async function getInstrumentList() {
        setListLoading(true);

        getListOfInstrumentsWhichHaveExistingSampleFiles()
            .then((instruments) => {
                if (instruments.length === 0) {
                    setMessage("No questionnaire samples found.");
                }

                setInstruments(instruments);
            })
            .catch(() => {
                setMessage("Unable to retrieve list of questionnaire samples.");
            });

    }

    return (
        <>
            <div>
                <div className="u-mt-m">
                    {instruments.length > 0 ?
                        <QuestionnaireList questionnaireList={instruments} loading={listLoading}/>
                        :
                        <ONSPanel spacious={true} status={message.includes("Unable") ? "error" : "info"}>{message}</ONSPanel>
                    }
                </div>
            </div>
        </>
    );
}

export default InstrumentListPage;
