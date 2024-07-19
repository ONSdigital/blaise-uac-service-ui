import { Questionnaire } from "blaise-api-node-client";
import { InstrumentUacDetails } from "blaise-uac-service-node-client";
import { QuestionnaireWithDisabledUacs } from "../models/model";

export const instrumentNames: string[] = [
    "OPN2101A",
    "DST1345A",
    "DST5643A",
];

export const questionnaireList: Questionnaire[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021",
    blaiseVersion: "5.9.9.2735"
}, {
    name: "OPN2007T",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Active",
    dataRecordCount: 10,
    hasData: true,
    active: true,
    fieldPeriod: "July 2020",
    blaiseVersion: "5.9.9.2735"

}, {
    name: "OPN2004A",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Failed",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020",
    blaiseVersion: "5.9.9.2735"

}];

export const questionnaireListForEnableUacsMock: Questionnaire[] = [{
    name: "LMS2209_EM1",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021",
    blaiseVersion: "5.9.9.2735"
}, {
    name: "LMS2207_HO1",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Active",
    dataRecordCount: 10,
    hasData: true,
    active: true,
    fieldPeriod: "July 2020",
    blaiseVersion: "5.9.9.2735"

}];

export const disabledUacCodesForQuestionnaireMock: InstrumentUacDetails = {
    "803920": {
        "instrument_name": "lms2209_em1",
        "case_id": "803920",
        "uac_chunks": { "uac1": "1002", "uac2": "2293", "uac3": "8976" },
        "full_uac": "100222938976",
        "disabled": "true"
    },
    "804138": {
        "instrument_name": "lms2209_em1",
        "case_id": "804138",
        "uac_chunks": { "uac1": "1002", "uac2": "6087", "uac3": "6564" },
        "full_uac": "100260876564",
        "disabled": "true"
    },
    "907195": {
        "instrument_name": "lms2209_em1",
        "case_id": "907195",
        "uac_chunks": { "uac1": "1004", "uac2": "6119", "uac3": "7282" },
        "full_uac": "100461197282",
        "disabled": "true"
    }
};

export const questionnaireWithDisabledUacsMock: QuestionnaireWithDisabledUacs =
{
    "questionnaireName": "LMS2209_EM1",
    "disabledUacs": [
        {
            "case_id": "803920",
            "uac": "100222938976"
        },
        {
            "case_id": "804138",
            "uac": "100260876564"
        },
        {
            "case_id": "907195",
            "uac": "100461197282"
        },

    ]
};

export const questionnaireWithOneDisabledUacMock: QuestionnaireWithDisabledUacs =
{
    "questionnaireName": "LMS2209_EM1",
    "disabledUacs": [
        {
            "case_id": "803920",
            "uac": "100222938976"
        }

    ]
};