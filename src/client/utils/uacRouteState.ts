import type { QuestionnaireWithDisabledUacs } from "../types/questionnaire.types";

export type ParsedRouteState<T> =
  | { status: "absent" }
  | { status: "invalid" }
  | { status: "valid"; value: T };

export interface DisableUacResultState {
  disabledUac: string;
  responseCode: 200 | 500;
}

export type DisableUacPageState =
  | { kind: "confirmation"; uac: string }
  | { kind: "result"; result: DisableUacResultState };

export type EnableUacPageState =
  | { kind: "table"; questionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs }
  | { kind: "confirmation"; questionnaireName: string; uac: string; case_id: string }
  | {
      kind: "summary";
      questionnaireName: string;
      uac: string;
      case_id: string;
      responseStatus: "success" | "error";
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isResponseStatus(value: unknown): value is "success" | "error" {
  return value === "success" || value === "error";
}

function isDisableUacResultState(value: unknown): value is DisableUacResultState {
  return (
    isRecord(value) &&
    isNonEmptyString(value.disabledUac) &&
    (value.responseCode === 200 || value.responseCode === 500)
  );
}

function isUacInfoArray(value: unknown): value is QuestionnaireWithDisabledUacs["disabledUacs"] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) => isRecord(entry) && isNonEmptyString(entry.case_id) && isNonEmptyString(entry.uac),
    )
  );
}

function isQuestionnaireWithDisabledUacs(value: unknown): value is QuestionnaireWithDisabledUacs {
  return (
    isRecord(value) &&
    isNonEmptyString(value.questionnaireName) &&
    isUacInfoArray(value.disabledUacs)
  );
}

function parseEnableSummaryState(
  state: Record<string, unknown>,
): ParsedRouteState<Extract<EnableUacPageState, { kind: "summary" }>> {
  const hasSummaryKey =
    "questionnaireName" in state ||
    "uac" in state ||
    "case_id" in state ||
    "responseStatus" in state;

  if (!hasSummaryKey) {
    return { status: "absent" };
  }

  if (
    isNonEmptyString(state.questionnaireName) &&
    isNonEmptyString(state.uac) &&
    isNonEmptyString(state.case_id) &&
    isResponseStatus(state.responseStatus)
  ) {
    return {
      status: "valid",
      value: {
        kind: "summary",
        questionnaireName: state.questionnaireName,
        uac: state.uac,
        case_id: state.case_id,
        responseStatus: state.responseStatus,
      },
    };
  }

  return { status: "invalid" };
}

export function parseEnableUacPageState(state: unknown): ParsedRouteState<EnableUacPageState> {
  if (state == null) {
    return { status: "absent" };
  }

  if (!isRecord(state)) {
    return { status: "invalid" };
  }

  if (state.step !== undefined) {
    if (
      state.step === "table" &&
      isQuestionnaireWithDisabledUacs(state.questionnaireWithDisabledUacs)
    ) {
      return {
        status: "valid",
        value: {
          kind: "table",
          questionnaireWithDisabledUacs: state.questionnaireWithDisabledUacs,
        },
      };
    }

    if (
      state.step === "confirmation" &&
      isNonEmptyString(state.questionnaireName) &&
      isNonEmptyString(state.uac) &&
      isNonEmptyString(state.case_id)
    ) {
      return {
        status: "valid",
        value: {
          kind: "confirmation",
          questionnaireName: state.questionnaireName,
          uac: state.uac,
          case_id: state.case_id,
        },
      };
    }

    return { status: "invalid" };
  }

  if (Object.keys(state).length === 0) {
    return { status: "absent" };
  }

  return parseEnableSummaryState(state);
}

export function parseDisableUacPageState(state: unknown): ParsedRouteState<DisableUacPageState> {
  if (state == null) {
    return { status: "absent" };
  }

  if (!isRecord(state)) {
    return { status: "invalid" };
  }

  if (state.step !== undefined) {
    if (state.step === "confirmation" && isNonEmptyString(state.uac)) {
      return { status: "valid", value: { kind: "confirmation", uac: state.uac } };
    }

    return { status: "invalid" };
  }

  if (Object.keys(state).length === 0) {
    return { status: "absent" };
  }

  if (state.disabledUac === "" && state.responseCode === 0) {
    return { status: "absent" };
  }

  if (isDisableUacResultState(state)) {
    return { status: "valid", value: { kind: "result", result: state } };
  }

  return { status: "invalid" };
}
