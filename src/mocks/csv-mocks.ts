import {InstrumentUacDetails} from "../server/api-clients/BusApi/interfaces/instrument-uac-details";

export const validSampleCsv = `serial_number,Name,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;

export const inValidSampleCsv = `serial_number,Phone Number,Email
100000001,Homer Simpson,5551234422,homer@springfield.com
100000002,Seymour Skinner,1235663322,a@b.c
100000003,Bart Simpson,2675465026,bart@spring.field
`;

export const matchedInstrumentUacDetails:InstrumentUacDetails = {
  "000975653827": {
    instrument_name: "dst2106a",
    case_id: "100000001",
    postcode_attempts: 0,
    postcode_attempt_timestamp: "",
    uac_chunks: {
      uac1: "0009",
      uac2: "7565",
      uac3: "3827"
    }
  },
  "345365454564": {
    instrument_name: "dst2106a",
    case_id: "100000002",
    postcode_attempts: 0,
    postcode_attempt_timestamp: "",
    uac_chunks: {
      uac1: "3453",
      uac2: "6545",
      uac3: "4564"
    }
  },
  "978975785367": {
    instrument_name: "dst2106a",
    case_id: "100000003",
    postcode_attempts: 0,
    postcode_attempt_timestamp: "",
    uac_chunks: {
      uac1: "9789",
      uac2: "7578",
      uac3: "5367"
    }
  }
};

export const unMatchedInstrumentUacDetails:InstrumentUacDetails = {
  "000975653827": {
    instrument_name: "dst2106a",
    case_id: "100000997",
    postcode_attempts: 0,
    postcode_attempt_timestamp: "",
    uac_chunks: {
      uac1: "0009",
      uac2: "7565",
      uac3: "3827"
    }
  },
  "345365454564": {
    instrument_name: "dst2106a",
    case_id: "100000998",
    postcode_attempts: 0,
    postcode_attempt_timestamp: "",
    uac_chunks: {
      uac1: "3453",
      uac2: "6545",
      uac3: "4564"
    }
  },
  "978975785367": {
    instrument_name: "dst2106a",
    case_id: "100000999",
    postcode_attempts: 0,
    postcode_attempt_timestamp: "",
    uac_chunks: {
      uac1: "9789",
      uac2: "7578",
      uac3: "5367"
    }
  }
};


