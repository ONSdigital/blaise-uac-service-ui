import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter, useLocation } from "react-router-dom";

import { mockQuestionnaireWithDisabledUacs } from "../../test-utils/api.mock";

import EnableUac from "./enableUacPage";

import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useLocation: vi.fn().mockReturnValue({ state: null }),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
  };
});

const mock = new MockAdapter(axios);

let queryClient: QueryClient;

function renderComponent() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EnableUac />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Enable Page", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mock.onGet(/\/api\/v1\/disabled-uacs$/).reply(200, [
      { questionnaire: "LMS2209_EM1", caseId: "803920", uac: "100222938976" },
      { questionnaire: "LMS2209_EM1", caseId: "804138", uac: "100260876564" },
      { questionnaire: "LMS2209_EM1", caseId: "907195", uac: "100461197282" },
    ]);
  });

  afterEach(() => {
    queryClient.clear();
    mock.reset();
  });

  it("renders the default enable heading", () => {
    renderComponent();

    expect(screen.getByText("Which UAC do you want to enable?")).toBeInTheDocument();
  });

  it("renders the table step when step==='table'", async () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: { step: "table", questionnaireWithDisabledUacs: mockQuestionnaireWithDisabledUacs },
    });

    renderComponent();

    expect(screen.getByText("Disabled UACs for")).toBeInTheDocument();
  });

  it("renders the confirmation step when step==='confirmation'", async () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: {
        step: "confirmation",
        questionnaireName: "LMS2209_EM1",
        uac: "100461197282",
        case_id: "907195",
      },
    });

    renderComponent();

    expect(screen.getByText(/Are you sure you want to enable UAC/i)).toBeInTheDocument();
  });

  it("renders the EnableUacSummary when responseStatus is set", async () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: {
        questionnaireName: "LMS2209_EM1",
        uac: "100461197282",
        case_id: "907195",
        responseStatus: "success",
      },
    });

    renderComponent();

    expect(
      screen.getByText(/UAC 100461197282 has been enabled for case 907195 in LMS2209_EM1/i),
    ).toBeInTheDocument();
  });

  it("renders an error panel when route state is malformed", async () => {
    (useLocation as Mock).mockReturnValueOnce({
      state: { step: "confirmation", questionnaireName: "LMS2209_EM1" },
    });

    renderComponent();

    expect(
      screen.getByText(/The requested enable-UAC screen state was invalid/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Which UAC do you want to enable?")).toBeInTheDocument();
  });
});
