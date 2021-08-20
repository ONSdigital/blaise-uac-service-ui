import React, {ReactElement, useState, useEffect} from "react";
import {getInstrumentsWithExistingUacCodes} from "./../../client/instrument-functions";
import InstrumentList from "./Sections/InstrumentList";

function InstrumentListPage(): ReactElement {
    const [message, setMessage] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);

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
            setMessage("");
        };
    }, []);

    async function getInstrumentList() {
        setListLoading(true);

        getInstrumentsWithExistingUacCodes()
            .then((instrumentList) => {
                if (instrumentList.length === 0) {
                    setMessage("No instruments found relating to uploaded samples.");
                }

                setInstruments(instrumentList);
            })
            .catch(() => {
                setMessage("Unable to retrieve list of instruments");
            });
    }

    return (
        <>
            <div>
                <div className="u-mt-m">
                    <InstrumentList instrumentList={instruments} message={message}
                                    loading={listLoading}/>
                </div>
            </div>
        </>
    );
}

export default InstrumentListPage;
