import {addUacCodesToFile, getCaseIdsFromFile} from "./csv-parser";
import {
    matchedInstrumentUacDetails,
    inValidSampleCsv,
    validSampleCsv,
    unMatchedInstrumentUacDetails, emptyInstrumentUacDetails, partialMatchedInstrumentUacDetails
} from "../../mocks/csv-mocks";


describe("getCaseIdsFromFile tests", () => {

    it("Valid CSV - expected case ids returned", async () => {
        const fileData = Buffer.from(validSampleCsv);

        const result = await getCaseIdsFromFile(fileData);

        expect(result).toContain("100000001");
        expect(result).toContain("100000002");
        expect(result).toContain("100000003");
    });

    it("Invalid CSV - error", async () => {
        console.error = jest.fn();
        const fileData = Buffer.from(inValidSampleCsv);

        const result = await getCaseIdsFromFile(fileData);
        expect(result).toEqual([]);

        expect(console.error).toHaveBeenCalledWith("Too many fields: expected 3 fields but parsed 4");
    });
});


describe("addUacCodesToFile tests", () => {

    it("Adds expected UAC chunks to the CSV", async () => {
        const fileData = Buffer.from(validSampleCsv);

        const result = await addUacCodesToFile(fileData, matchedInstrumentUacDetails);

        expect(result).toContainEqual({
            "serial_number": "100000001",
            "Name": "Homer Simpson",
            "Phone Number": "5551234422",
            "Email": "homer@springfield.com",
            "uac1": "0009",
            "uac2": "7565",
            "uac3": "3827"
        });
        expect(result).toContainEqual({
            "serial_number": "100000002",
            "Name": "Seymour Skinner",
            "Phone Number": "1235663322",
            "Email": "a@b.c",
            "uac1": "3453",
            "uac2": "6545",
            "uac3": "4564"
        });
        expect(result).toContainEqual({
            "serial_number": "100000003",
            "Name": "Bart Simpson",
            "Phone Number": "2675465026",
            "Email": "bart@spring.field",
            "uac1": "9789",
            "uac2": "7578",
            "uac3": "5367"
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
        const fileData = Buffer.from(inValidSampleCsv);

        const result = await addUacCodesToFile(fileData, emptyInstrumentUacDetails);
        expect(result).toEqual([]);

        expect(console.error).toHaveBeenCalledWith("Too many fields: expected 3 fields but parsed 4");
    });
});