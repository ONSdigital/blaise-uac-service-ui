import { parseDisableUacPageState, parseEnableUacPageState } from "./uacRouteState";

const questionnaireWithDisabledUacs = {
  questionnaireName: "DST1234A",
  disabledUacs: [{ case_id: "100000001", uac: "123456789012" }],
};

describe("parseEnableUacPageState", () => {
  it("returns absent when state is null", () => {
    expect(parseEnableUacPageState(null)).toEqual({ status: "absent" });
  });

  it("returns invalid when state is not an object", () => {
    expect(parseEnableUacPageState("bad state")).toEqual({ status: "invalid" });
  });

  it("returns absent when the object is empty", () => {
    expect(parseEnableUacPageState({})).toEqual({ status: "absent" });
  });

  it("returns absent when the object has no relevant summary keys", () => {
    expect(parseEnableUacPageState({ foo: "bar" })).toEqual({ status: "absent" });
  });

  it("returns a valid table state when the questionnaire payload is well formed", () => {
    expect(
      parseEnableUacPageState({
        step: "table",
        questionnaireWithDisabledUacs,
      }),
    ).toEqual({
      status: "valid",
      value: {
        kind: "table",
        questionnaireWithDisabledUacs,
      },
    });
  });

  it("returns invalid when the table payload contains blank UAC details", () => {
    expect(
      parseEnableUacPageState({
        step: "table",
        questionnaireWithDisabledUacs: {
          questionnaireName: "DST1234A",
          disabledUacs: [{ case_id: "", uac: "123456789012" }],
        },
      }),
    ).toEqual({ status: "invalid" });
  });

  it("returns a valid confirmation state when the route state is complete", () => {
    expect(
      parseEnableUacPageState({
        step: "confirmation",
        questionnaireName: "DST1234A",
        uac: "123456789012",
        case_id: "100000001",
      }),
    ).toEqual({
      status: "valid",
      value: {
        kind: "confirmation",
        questionnaireName: "DST1234A",
        uac: "123456789012",
        case_id: "100000001",
      },
    });
  });

  it("returns invalid when the confirmation route state is incomplete", () => {
    expect(
      parseEnableUacPageState({
        step: "confirmation",
        questionnaireName: "DST1234A",
        uac: "123456789012",
      }),
    ).toEqual({ status: "invalid" });
  });

  it("returns a valid summary state when the summary payload is complete", () => {
    expect(
      parseEnableUacPageState({
        questionnaireName: "DST1234A",
        uac: "123456789012",
        case_id: "100000001",
        responseStatus: "success",
      }),
    ).toEqual({
      status: "valid",
      value: {
        kind: "summary",
        questionnaireName: "DST1234A",
        uac: "123456789012",
        case_id: "100000001",
        responseStatus: "success",
      },
    });
  });

  it("returns invalid when the summary payload contains an invalid response status", () => {
    expect(
      parseEnableUacPageState({
        questionnaireName: "DST1234A",
        uac: "123456789012",
        case_id: "100000001",
        responseStatus: "pending",
      }),
    ).toEqual({ status: "invalid" });
  });
});

describe("parseDisableUacPageState", () => {
  it("returns absent when state is null", () => {
    expect(parseDisableUacPageState(null)).toEqual({ status: "absent" });
  });

  it("returns invalid when state is not an object", () => {
    expect(parseDisableUacPageState(42)).toEqual({ status: "invalid" });
  });

  it("returns absent when the object is empty", () => {
    expect(parseDisableUacPageState({})).toEqual({ status: "absent" });
  });

  it("returns absent for the legacy empty result state", () => {
    expect(parseDisableUacPageState({ disabledUac: "", responseCode: 0 })).toEqual({
      status: "absent",
    });
  });

  it("returns a valid confirmation state when the route state is complete", () => {
    expect(parseDisableUacPageState({ step: "confirmation", uac: "123456789012" })).toEqual({
      status: "valid",
      value: { kind: "confirmation", uac: "123456789012" },
    });
  });

  it("returns invalid when the confirmation state contains a blank UAC", () => {
    expect(parseDisableUacPageState({ step: "confirmation", uac: "" })).toEqual({
      status: "invalid",
    });
  });

  it("returns a valid result state when the result payload is complete", () => {
    expect(parseDisableUacPageState({ disabledUac: "123456789012", responseCode: 200 })).toEqual({
      status: "valid",
      value: {
        kind: "result",
        result: { disabledUac: "123456789012", responseCode: 200 },
      },
    });
  });

  it("returns invalid when the result payload has an unsupported response code", () => {
    expect(parseDisableUacPageState({ disabledUac: "123456789012", responseCode: 418 })).toEqual({
      status: "invalid",
    });
  });
});
