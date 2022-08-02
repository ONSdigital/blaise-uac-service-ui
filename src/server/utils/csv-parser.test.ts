import { addUacCodesToFile, getCaseIdsFromFile, getUacsFromFile } from "./csv-parser";
import {
    matchedInstrumentUacDetails,
    matchedInstrumentUac16Details,
    invalidSampleCsv,
    validSampleCsv,
    validSampleCsvWithDuplicateSerialNumbers,
    validUACImportCsv,
    unMatchedInstrumentUacDetails,
    emptyInstrumentUacDetails,
    partialMatchedInstrumentUacDetails,
    validSampleCsvWithExistingLowercaseUacColumns,
    validSampleCsvWithExistingMixedCaseUacColumns,
    validSampleCsvWithExistingUacEntries,
    validSampleCsvWithExistingUacColumns,
    duplicateColumnSampleCsv
} from "../../mocks/csv-mocks";

describe("getUacsFromFile tests", () => {
    it("Valid CSV - returns a list of UACs", async () => {
        const fileData = Buffer.from(validUACImportCsv);

        const result = await getUacsFromFile(fileData);

        expect(result).toHaveLength(4);
        expect(result).toContain("123412341234");
        expect(result).toContain("432143214321");
        expect(result).toContain("678967896789");
        expect(result).toContain("987698769876");
    });

    it("Throws an error when columns are invalid", async() => {
        const fileData = Buffer.from(validSampleCsv);

        await expect(getUacsFromFile(fileData)).rejects.toThrow("UAC column \"Full_UAC\" not in CSV");
    });
});

describe("getCaseIdsFromFile tests", () => {

    it("Valid CSV - expected case ids returned", async () => {
        const fileData = Buffer.from(validSampleCsv);

        const result = await getCaseIdsFromFile(fileData);

        expect(result).toContain("100000001");
        expect(result).toContain("100000002");
        expect(result).toContain("100000003");
    });

    it("Missing column - error", async () => {
        const fileData = Buffer.from(validUACImportCsv);

        await expect(getCaseIdsFromFile(fileData)).rejects.toThrow("Missing column 'serial_number'");
    });

    it("Invalid CSV - error", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(invalidSampleCsv);

        await expect(getCaseIdsFromFile(fileData)).rejects.toThrow("There is a problem with the CSV file");

        expect(console.error).toHaveBeenCalledWith("Unexpected Error: column header mismatch expected: 3 columns got: 4");
    });

    it("Duplicate column - error", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(duplicateColumnSampleCsv);

        await expect(getCaseIdsFromFile(fileData)).rejects.toThrow("There is a problem with the CSV file, please ensure all column headings are unique");

        expect(console.error).toHaveBeenCalledWith("Duplicate headers found [\"serial_number\"]");
    });

    it("contains duplicate serial numbers", async () =>{
        console.error = jest.fn();
        const fileData = Buffer.from(validSampleCsvWithDuplicateSerialNumbers);

        await expect(getCaseIdsFromFile(fileData)).rejects.toThrow("There is a problem with the CSV file, please ensure all IDs in the serial_number column are unique");
    });

});

describe("addUacCodesToFile tests", () => {

    it("Adds expected UAC chunks to the CSV where there are no UAC entries in the file", async () => {
        const fileData = Buffer.from(validSampleCsv);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUacDetails);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com",
            "UAC1": "0009",
            "UAC2": "7565",
            "UAC3": "3827",
            "UAC": "000975653827"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "Phone Number": "1235663322",
            "Email": "a@b.c",
            "UAC1": "3453",
            "UAC2": "6545",
            "UAC3": "4564",
            "UAC": "345365454564"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field",
            "UAC1": "9789",
            "UAC2": "7578",
            "UAC3": "5367",
            "UAC": "978975785367"
        });
    });

    it("Adds expected 16 digit UAC chunks to the CSV where there are no UAC entries in the file", async () => {
        const fileData = Buffer.from(validSampleCsv);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUac16Details);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com",
            "UAC1": "0009",
            "UAC2": "7565",
            "UAC3": "3827",
            "UAC4": "7512",
            "UAC": "0009756538277512"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "Phone Number": "1235663322",
            "Email": "a@b.c",
            "UAC1": "3453",
            "UAC2": "6545",
            "UAC3": "4564",
            "UAC4": "3213",
            "UAC": "3453654545643213"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field",
            "UAC1": "9789",
            "UAC2": "7578",
            "UAC3": "5367",
            "UAC4": "8765",
            "UAC": "9789757853678765"
        });
    });

    it("Adds expected UAC chunks to the CSV where there are are existing UAC columns in the file", async () => {
        const fileData = Buffer.from(validSampleCsvWithExistingUacColumns);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUacDetails);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "UAC1": "0009",
            "UAC2": "7565",
            "UAC3": "3827",
            "UAC": "000975653827",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "UAC1": "3453",
            "UAC2": "6545",
            "UAC3": "4564",
            "UAC": "345365454564",
            "Phone Number": "1235663322",
            "Email": "a@b.c"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "UAC1": "9789",
            "UAC2": "7578",
            "UAC3": "5367",
            "UAC": "978975785367",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field"
        });
    });

    it("Overwrites UAC chunks to the CSV where there are are existing UAC entries in the file", async () => {
        const fileData = Buffer.from(validSampleCsvWithExistingUacEntries);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUacDetails);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "UAC1": "0009",
            "UAC2": "7565",
            "UAC3": "3827",
            "UAC": "000975653827",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "UAC1": "3453",
            "UAC2": "6545",
            "UAC3": "4564",
            "UAC": "345365454564",
            "Phone Number": "1235663322",
            "Email": "a@b.c"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "UAC1": "9789",
            "UAC2": "7578",
            "UAC3": "5367",
            "UAC": "978975785367",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field"
        });
    });

    it("Unmatched instrument UAC results - returns an empty array", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(validSampleCsv);

        const result = await addUacCodesToFile(fileData, unMatchedInstrumentUacDetails);
        expect(result).toEqual([]);

        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000001");
        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000002");
        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000003");
    });

    it("Partial Matched instrument UAC results - returns an empty array", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(validSampleCsv);

        const result = await addUacCodesToFile(fileData, partialMatchedInstrumentUacDetails);
        expect(result).toEqual([]);

        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000001");
        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000003");
    });

    it("Empty instrument UAC results - returns an empty array", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(validSampleCsv);

        const result = await addUacCodesToFile(fileData, emptyInstrumentUacDetails);
        expect(result).toEqual([]);

        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000001");
        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000002");
        expect(console.error).toHaveBeenCalledWith("No UAC chunks found that matches the case id 100000003");
    });

    it("Invalid CSV - returns an empty array", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(invalidSampleCsv);

        const result = await addUacCodesToFile(fileData, emptyInstrumentUacDetails);
        expect(result).toEqual([]);

        expect(console.error).toHaveBeenCalledWith("Unexpected Error: column header mismatch expected: 3 columns got: 4");
    });

    it("Uploaded CSV with lowercase UAC headings - returns CSV with those columns populated", async () =>{
        console.error = jest.fn();
        const fileData = Buffer.from(validSampleCsvWithExistingLowercaseUacColumns);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUacDetails);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "uac1": "0009",
            "uac2": "7565",
            "uac3": "3827",
            "UAC": "000975653827",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "uac1": "3453",
            "uac2": "6545",
            "uac3": "4564",
            "UAC": "345365454564",
            "Phone Number": "1235663322",
            "Email": "a@b.c"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "uac1": "9789",
            "uac2": "7578",
            "uac3": "5367",
            "UAC": "978975785367",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field"
        });

    });

    it("Uploaded CSV with mixed case UAC headings - returns CSV with those columns populated", async () =>{
        console.error = jest.fn();
        const fileData = Buffer.from(validSampleCsvWithExistingMixedCaseUacColumns);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUacDetails);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "UaC1": "0009",
            "UaC2": "7565",
            "UaC3": "3827",
            "UAC": "000975653827",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "UaC1": "3453",
            "UaC2": "6545",
            "UaC3": "4564",
            "UAC": "345365454564",
            "Phone Number": "1235663322",
            "Email": "a@b.c"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "UaC1": "9789",
            "UaC2": "7578",
            "UaC3": "5367",
            "UAC": "978975785367",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field"
        });

    });
});
