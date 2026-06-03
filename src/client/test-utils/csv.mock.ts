/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CsvDatas } from "../csv.types";
import type { UacsByCaseId } from "blaise-uac-service-node-client";

const mockValidUacImportCsv = `UAC
123412341234
432143214321
678967896789
987698769876
`;

const mockValidSampleCsv = `serial_number,Name,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;

const mockValidSampleCsvWithExistingUacColumns = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

const mockValidSampleCsvWithExistingLowercaseUacColumns = `serial_number,Name,uac1,uac2,uac3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

const mockValidSampleCsvWithExistingMixedCaseUacColumns = `serial_number,Name,UaC1,UaC2,UaC3,Phone Number,Email
100000001,Homer Simpson,,,,5551234422,homer@springfield.com
100000002,Seymour Skinner,,,,1235663322,a@b.c
100000003,Bart Simpson,,,,2675465026,bart@spring.field
`;

const mockValidSampleCsvWithExistingUacEntries = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,3454,5453,5353,5551234422,homer@springfield.com
100000002,Seymour Skinner,8786,2213,3343,1235663322,a@b.c
100000003,Bart Simpson,2242,5543,7676,2675465026,bart@spring.field
`;

const mockInvalidSampleCsv = `serial_number,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;

const mockDuplicateColumnSampleCsv = `serial_number,Phone Number,Email,serial_number
100000001,Homer Simpson,5551234422,homer@springfield.com,100000001
100000002,Seymour Skinner,1235663322,a@b.c,100000002
100000003,Bart Simpson,2675465026,bart@spring.field,100000003
`;

const mockValidSampleCsvWithDuplicateSerialNumbers = `serial_number,Name,UAC1,UAC2,UAC3,Phone Number,Email
100000001,Homer Simpson,3454,5453,5353,5551234422,homer@springfield.com
100000001,Marge Simpson,1337,1234,5678,1251234422,marge@springfield.com
100000002,Seymour Skinner,8786,2213,3343,1235663322,a@b.c
100000003,Bart Simpson,2242,5543,7676,2675465026,bart@spring.field
`;

const mockMatchedQuestionnaireUacDetails: UacsByCaseId = {
  "100000001": {
    questionnaire_name: "dst2106a",
    case_id: "100000001",
    uac_chunks: {
      uac1: "0009",
      uac2: "7565",
      uac3: "3827",
    },
    full_uac: "000975653827",
    disabled: false,
  },
  "100000002": {
    questionnaire_name: "dst2106a",
    case_id: "100000002",
    uac_chunks: {
      uac1: "3453",
      uac2: "6545",
      uac3: "4564",
    },
    full_uac: "345365454564",
    disabled: false,
  },
  "100000003": {
    questionnaire_name: "dst2106a",
    case_id: "100000003",
    uac_chunks: {
      uac1: "9789",
      uac2: "7578",
      uac3: "5367",
    },
    full_uac: "978975785367",
    disabled: false,
  },
};

const mockMatchedQuestionnaireUac16Details: UacsByCaseId = {
  "100000001": {
    questionnaire_name: "dst2106a",
    case_id: "100000001",
    uac_chunks: {
      uac1: "0009",
      uac2: "7565",
      uac3: "3827",
      uac4: "7512",
    },
    full_uac: "0009756538277512",
    disabled: false,
  },
  "100000002": {
    questionnaire_name: "dst2106a",
    case_id: "100000002",
    uac_chunks: {
      uac1: "3453",
      uac2: "6545",
      uac3: "4564",
      uac4: "3213",
    },
    full_uac: "3453654545643213",
    disabled: false,
  },
  "100000003": {
    questionnaire_name: "dst2106a",
    case_id: "100000003",
    uac_chunks: {
      uac1: "9789",
      uac2: "7578",
      uac3: "5367",
      uac4: "8765",
    },
    full_uac: "9789757853678765",
    disabled: false,
  },
};

const mockUnMatchedQuestionnaireUacDetails: UacsByCaseId = {
  "100000997": {
    questionnaire_name: "dst2106a",
    case_id: "100000997",
    uac_chunks: {
      uac1: "0009",
      uac2: "7565",
      uac3: "3827",
    },
    full_uac: "000975653827",
    disabled: false,
  },
  "100000998": {
    questionnaire_name: "dst2106a",
    case_id: "100000998",
    uac_chunks: {
      uac1: "3453",
      uac2: "6545",
      uac3: "4564",
    },
    full_uac: "345365454564",
    disabled: false,
  },
  "100000999": {
    questionnaire_name: "dst2106a",
    case_id: "100000999",
    uac_chunks: {
      uac1: "9789",
      uac2: "7578",
      uac3: "5367",
    },
    full_uac: "978975785367",
    disabled: false,
  },
};

const mockPartialMatchedQuestionnaireUacDetails: UacsByCaseId = {
  "100000002": {
    questionnaire_name: "dst2106a",
    case_id: "100000002",
    uac_chunks: {
      uac1: "3453",
      uac2: "6545",
      uac3: "4564",
    },
    full_uac: "345365454564",
    disabled: false,
  },
};

const mockEmptyQuestionnaireUacDetails: UacsByCaseId = {};

const mockValidSampleFileWithUacArrayResponse: Record<string, string>[] = [
  {
    serial_number: "100000001",
    name: "Homer Simpson",
    phone: "5551234422",
    email: "homer@springfield.com",
    UAC1: "0009",
    UAC2: "7565",
    UAC3: "3827",
  },
  {
    serial_number: "100000002",
    name: "Seymour Skinner",
    phone: "1235663322",
    email: "a@b.c",
    UAC1: "3453",
    UAC2: "6545",
    UAC3: "4564",
  },
];

export const mockValidSampleFileWithUacDatasResponse: CsvDatas = [
  {
    serial_number: "100000001",
    name: "Homer Simpson",
    phone: "5551234422",
    email: "homer@springfield.com",
    UAC1: "0009",
    UAC2: "7565",
    UAC3: "3827",
  },
  {
    serial_number: "100000002",
    name: "Seymour Skinner",
    phone: "1235663322",
    email: "a@b.c",
    UAC1: "3453",
    UAC2: "6545",
    UAC3: "4564",
  },
];
