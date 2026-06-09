import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter, useNavigate } from "react-router-dom";

import QuestionnairesWithDisabledUacs from "./questionnairesWithDisabledUacs";

import type * as ReactRouterDom from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("blaise-login-react-client", () => ({
  Authenticate: ({
    children,
  }: {
    children: (user: null, loggedIn: boolean, logOutFunction: () => void) => React.ReactNode;
  }) => children(null, true, vi.fn()),
  createSessionKey: vi.fn().mockReturnValue("mock-session-key"),
  AuthManager: class {
    authHeader() {
      return {};
    }
  },
}));

const mock = new MockAdapter(axios);

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof ReactRouterDom>();

  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

let navigate: Mock;
let queryClient: QueryClient;
const disabledUacRows = [
  { questionnaire: "LMS2209_EM1", caseId: "803920", uac: "100222938976" },
  { questionnaire: "LMS2207_HO1", caseId: "804138", uac: "100260876564" },
];

function renderComponent() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <QuestionnairesWithDisabledUacs />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("List of Questionnaires with disabled UACs", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mock.onGet("/api/v1/disabled-uacs").reply(200, disabledUacRows);
  });

  afterEach(() => {
    queryClient.clear();
    mock.reset();
  });

  it("renders disabled UAC rows", async () => {
    renderComponent();

    const rows = await screen.findAllByTestId("disabled-uac-row");

    expect(rows).toHaveLength(2);
    expect(await screen.findByText("LMS2209_EM1")).toBeInTheDocument();
  });

  it("navigates to enable confirmation when user clicks Enable UAC", async () => {
    navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);
    renderComponent();

    const enableButtons = await screen.findAllByRole("button", { name: "Enable UAC" });

    fireEvent.click(enableButtons[0]);

    expect(navigate).toHaveBeenCalledWith("/enable-uac", {
      state: {
        step: "confirmation",
        questionnaireName: "LMS2209_EM1",
        case_id: "803920",
        uac: "100222938976",
      },
    });
  });

  it("shows 'no disabled UACs' message when all questionnaires have no disabled UACs", async () => {
    mock.reset();
    mock.onGet("/api/v1/disabled-uacs").reply(200, []);

    renderComponent();

    await screen.findByText("There are no disabled UACs for active questionnaires.");
  });

  it("shows 'no disabled UACs' message when API returns empty list", async () => {
    mock.reset();
    mock.onGet("/api/v1/disabled-uacs").reply(200, []);

    renderComponent();

    await screen.findByText("There are no disabled UACs for active questionnaires.");
  });

  it("shows error message when API call fails", async () => {
    mock.onGet("/api/v1/disabled-uacs").reply(500);

    renderComponent();

    await screen.findByText("Unable to retrieve disabled UACs");
  });
});
