import { fireEvent } from "@testing-library/react";
import { act } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import "@testing-library/jest-dom";
import {
  mockQuestionnaireWithDisabledUacs,
  mockQuestionnaireWithOneDisabledUac,
} from "../../../test-utils/api.mock";
import flushPromises from "../../../test-utils/flushPromises";
import { renderWithQueryClient } from "../../../test-utils/renderWithQueryClient";
import EnableUac from "../enableUacPage";

vi.mock("./questionnairesWithDisabledUacs");

vi.mock("axios");

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

describe("Disable UAC page works as expected", () => {
  it("displays the correct content on navigating to list Disabled UACs for a questionnaire in table", async () => {
    const initialEntries = [
      {
        pathname: "/enable-uac",
        state: { step: "table", questionnaireWithDisabledUacs: mockQuestionnaireWithDisabledUacs },
      },
    ];

    const { getByText } = renderWithQueryClient(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/enable-uac"
            Component={EnableUac}
          />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });
    expect(getByText(mockQuestionnaireWithDisabledUacs.questionnaireName)).toBeInTheDocument();
    expect(getByText("Disabled UACs for")).toBeInTheDocument();
    expect(getByText("Case ID")).toBeDefined();
    expect(getByText("Enable")).toBeDefined();
  });

  it("navigates to the enable UAC confirmation component when user clicks on the Enable UAC link", async () => {
    const initialEntries = [
      {
        pathname: "/enable-uac",
        state: {
          step: "table",
          questionnaireWithDisabledUacs: mockQuestionnaireWithOneDisabledUac,
        },
      },
    ];

    const { getByRole, getByText } = renderWithQueryClient(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/enable-uac"
            Component={EnableUac}
          />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    const tableElement = getByRole("table");

    expect(tableElement).toBeInTheDocument();

    const bodyRows = tableElement.querySelectorAll("tbody > tr");

    expect(bodyRows).toHaveLength(1);

    const cells = bodyRows[0].querySelectorAll("td");

    expect(cells).toHaveLength(2);
    expect(cells[0].textContent).toStrictEqual(
      mockQuestionnaireWithOneDisabledUac.disabledUacs[0].case_id,
    );
    expect(cells[1].textContent).toStrictEqual("Enable UAC");

    const link = getByText("Enable UAC");

    act(() => {
      fireEvent.click(link);
    });
    await act(async () => {
      await flushPromises();
    });
    expect(getByText(/Are you sure you want to enable this UAC for questionnaire/i)).toBeDefined();
    expect(getByText(mockQuestionnaireWithOneDisabledUac.disabledUacs[0].case_id)).toBeDefined();
    expect(getByText(mockQuestionnaireWithOneDisabledUac.questionnaireName)).toBeDefined();
  });

  it("renders an error panel when table state is malformed", async () => {
    const { getByText } = renderWithQueryClient(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/enable-uac",
            state: { step: "table", questionnaireWithDisabledUacs: null },
          },
        ]}
      >
        <Routes>
          <Route
            path="/enable-uac"
            Component={EnableUac}
          />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    expect(getByText(/The requested enable-UAC screen state was invalid/i)).toBeInTheDocument();
    expect(getByText("Select a disabled UAC to enable")).toBeInTheDocument();
  });
});
