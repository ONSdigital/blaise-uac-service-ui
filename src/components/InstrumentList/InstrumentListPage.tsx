import React, {ReactElement, useState, useEffect} from "react";
import {getInstrumentsWithExistingUacCodes} from "./../../client/instrument-functions";
import InstrumentList from "./Sections/InstrumentList";
import {ONSErrorPanel} from "blaise-design-system-react-components";

function InstrumentListPage(): ReactElement {
    const [instruments, setInstruments] = useState<string[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [listMessage, setListMessage] = useState<string>("");

    useEffect(() => {
        let mounted = true;
        getInstrumentList().then(() => {
            if(mounted) {
                setListLoading(false);
            }
        });

        return function cleanup() {
            mounted = false;
            setInstruments([]);
            setListMessage("");
        };
    }, []);

    async function getInstrumentList() {
        setListLoading(true);

        getInstrumentsWithExistingUacCodes()
            .then((instrumentList) => {
                if (instrumentList.length === 0) {
                    setListMessage("No instruments found relating to uploaded samples.");
                }

                setInstruments(instrumentList);
            })
            .catch(() => {
                setListMessage("Error trying to retrieve list of instruments");
            });
    }

    return (
        <>
            <div>
                <div className="u-mt-m">
                    {listMessage.includes("Unable") && <ONSErrorPanel/>}
                    <InstrumentList instrumentList={instruments} listMessage={listMessage}
                                    loading={listLoading}/>
                </div>
            </div>
        </>
    );
}

export default InstrumentListPage;
