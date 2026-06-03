import { DISABLED_UACS_QUERY_KEY, QUESTIONNAIRE_NAMES_QUERY_KEY } from "./queryKeys";

describe("queryKeys", () => {
  it("exposes stable base query keys", () => {
    expect(QUESTIONNAIRE_NAMES_QUERY_KEY).toStrictEqual(["questionnaire-names"]);
    expect(DISABLED_UACS_QUERY_KEY).toStrictEqual(["disabled-uacs"]);
  });
});
