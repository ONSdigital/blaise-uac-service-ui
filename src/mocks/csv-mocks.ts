import {InstrumentUacDetailsByCaseId} from "bus-api-node-client";
import {Datas} from "react-csv-downloader/dist/esm/lib/csv";

export const validSampleCsv = `serial_number,Name,Phone Number,Email,UAC1,UAC2,UAC3
100000001,Homer Simpson,5551234422,homer@springfield.com,9999,9999,1001
100000002,Seymour Skinner,1235663322,a@b.c,9999,9999,1002
100000003,Bart Simpson,2675465026,bart@spring.field,9999,9999,1003
`;

export const validSampleCsvWithExistingUacColumns = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

export const validSampleCsvWithExistingUacEntries = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,3454,5453,5353,5551234422,homer@springfield.com
100000002,Seymour Skinner,8786,2213,3343,1235663322,a@b.c
100000003,Bart Simpson,2242,5543,7676,2675465026,bart@spring.field
`;

export const inValidSampleCsv = `serial_number,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;

export const matchedInstrumentUacDetails: InstrumentUacDetailsByCaseId = {
    "100000001": {
        instrument_name: "dst2106a",
        case_id: "100000001",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "0009",
            uac2: "7565",
            uac3: "3827"
        },
        FullUAC: "000975653827"
    },
    "100000002": {
        instrument_name: "dst2106a",
        case_id: "100000002",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        },
        FullUAC: "345365454564"
    },
    "100000003": {
        instrument_name: "dst2106a",
        case_id: "100000003",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "9789",
            uac2: "7578",
            uac3: "5367"
        },
        FullUAC: "978975785367"
    }
};

export const unMatchedInstrumentUacDetails: InstrumentUacDetailsByCaseId = {
    "100000997": {
        instrument_name: "dst2106a",
        case_id: "100000997",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "0009",
            uac2: "7565",
            uac3: "3827"
        },
        FullUAC: "000975653827"
    },
    "100000998": {
        instrument_name: "dst2106a",
        case_id: "100000998",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        },
        FullUAC: "345365454564"
    },
    "100000999": {
        instrument_name: "dst2106a",
        case_id: "100000999",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "9789",
            uac2: "7578",
            uac3: "5367"
        },
        FullUAC: "978975785367"
    }
};

export const partialMatchedInstrumentUacDetails: InstrumentUacDetailsByCaseId = {
    "100000002": {
        instrument_name: "dst2106a",
        case_id: "100000002",
        postcode_attempts: 0,
        postcode_attempt_timestamp: "",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        },
        FullUAC: "345365454564"
    }
};

export const emptyInstrumentUacDetails: InstrumentUacDetailsByCaseId = {};

export const validSampleFileWithUacArrayResponse: any[] = [
    {
        serial_number: "100000001",
        name: "Homer Simpson",
        phone: "5551234422",
        email: "homer@springfield.com",
        UAC1: "0009",
        UAC2: "7565",
        UAC3: "3827"
    },
    {
        serial_number: "100000002",
        name: "Seymour Skinner",
        phone: "1235663322",
        email: "a@b.c",
        UAC1: "3453",
        UAC2: "6545",
        UAC3: "4564"
    }
];

export const validSampleFileWithUacDatasResponse: Datas = [
    {
        serial_number: "100000001",
        name: "Homer Simpson",
        phone: "5551234422",
        email: "homer@springfield.com",
        UAC1: "0009",
        UAC2: "7565",
        UAC3: "3827"
    },
    {
        serial_number: "100000002",
        name: "Seymour Skinner",
        phone: "1235663322",
        email: "a@b.c",
        UAC1: "3453",
        UAC2: "6545",
        UAC3: "4564"
    }
];
