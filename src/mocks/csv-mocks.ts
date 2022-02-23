import { InstrumentUacDetailsByCaseId } from "blaise-uac-service-node-client";
import { Datas } from "react-csv-downloader/dist/esm/lib/csv";

export const validUACImportCsv = `Full_UAC
123412341234
432143214321
678967896789
987698769876
`;

export const validSampleCsv = `serial_number,Name,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;

export const validSampleCsvWithExistingUacColumns = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

export const validSampleCsvWithExistingLowercaseUacColumns = `serial_number,Name,uac1,uac2,uac3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

export const validSampleCsvWithExistingMixedCaseUacColumns = `serial_number,Name,UaC1,UaC2,UaC3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

export const validSampleCsvWithExistingUacEntries = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,3454,5453,5353,5551234422,homer@springfield.com
100000002,Seymour Skinner,8786,2213,3343,1235663322,a@b.c
100000003,Bart Simpson,2242,5543,7676,2675465026,bart@spring.field
`;

export const invalidSampleCsv = `serial_number,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;


export const matchedInstrumentUacDetails: InstrumentUacDetailsByCaseId = {
    "100000001": {
        instrument_name: "dst2106a",
        case_id: "100000001",
        uac_chunks: {
            uac1: "0009",
            uac2: "7565",
            uac3: "3827"
        },
        full_uac: "000975653827"
    },
    "100000002": {
        instrument_name: "dst2106a",
        case_id: "100000002",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        },
        full_uac: "345365454564"
    },
    "100000003": {
        instrument_name: "dst2106a",
        case_id: "100000003",
        uac_chunks: {
            uac1: "9789",
            uac2: "7578",
            uac3: "5367"
        },
        full_uac: "978975785367"
    }
};

export const matchedInstrumentUac16Details: InstrumentUacDetailsByCaseId = {
    "100000001": {
        instrument_name: "dst2106a",
        case_id: "100000001",
        uac_chunks: {
            uac1: "0009",
            uac2: "7565",
            uac3: "3827",
            uac4: "7512"
        },
        full_uac: "0009756538277512"
    },
    "100000002": {
        instrument_name: "dst2106a",
        case_id: "100000002",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564",
            uac4: "3213"
        },
        full_uac: "3453654545643213"
    },
    "100000003": {
        instrument_name: "dst2106a",
        case_id: "100000003",
        uac_chunks: {
            uac1: "9789",
            uac2: "7578",
            uac3: "5367",
            uac4: "8765"
        },
        full_uac: "9789757853678765"
    }
};

export const unMatchedInstrumentUacDetails: InstrumentUacDetailsByCaseId = {
    "100000997": {
        instrument_name: "dst2106a",
        case_id: "100000997",
        uac_chunks: {
            uac1: "0009",
            uac2: "7565",
            uac3: "3827"
        },
        full_uac: "000975653827"
    },
    "100000998": {
        instrument_name: "dst2106a",
        case_id: "100000998",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        },
        full_uac: "345365454564"
    },
    "100000999": {
        instrument_name: "dst2106a",
        case_id: "100000999",
        uac_chunks: {
            uac1: "9789",
            uac2: "7578",
            uac3: "5367"
        },
        full_uac: "978975785367"
    }
};

export const partialMatchedInstrumentUacDetails: InstrumentUacDetailsByCaseId = {
    "100000002": {
        instrument_name: "dst2106a",
        case_id: "100000002",
        uac_chunks: {
            uac1: "3453",
            uac2: "6545",
            uac3: "4564"
        },
        full_uac: "345365454564"
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
