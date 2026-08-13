import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";

import { getListOfQuestionnairesWithExistingSampleFiles } from "./api/fileFunctions";
import App from "./app";
import { mockQuestionnaireNames } from "./test-utils/api.mock";

import type { QuestionnaireFile } from "./types/questionnaire.types";
import type { Mock } from "vitest";

const mockAuthenticate = vi.fn(
  ({
    children,
  }: {
    children: (
      user: { name: string },
      loggedIn: boolean,
      logOutFunction: () => void,
    ) => React.ReactNode;
  }) => children({ name: "test-user" } as never, true, vi.fn()),
);

vi.mock("blaise-login-react-client", () => ({
  Authenticate: (props: {
    children: (
      user: { name: string },
      loggedIn: boolean,
      logOutFunction: () => void,
    ) => React.ReactNode;
  }) => mockAuthenticate(props),
  createSessionKey: vi.fn().mockReturnValue("mock-session-key"),
  AuthManager: class {
    authHeader() {
      return {};
    }
  },
}));

vi.mock("./api/fileFunctions");

const mockIsProduction = vi.fn();

vi.mock("./utils/env", () => ({
  isProduction: () => mockIsProduction(),
}));

vi.mock("./utils/auth", () => ({
  getSharedAuthOptions: () => ({
    sessionKey: "mock-session-key",
    cookieDomain: "mock-domain",
  }),
}));

const getListOfQuestionnairesWithExistingSampleFilesMock =
  getListOfQuestionnairesWithExistingSampleFiles as Mock<() => Promise<QuestionnaireFile[]>>;

describe("React homepage", () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    getListOfQuestionnairesWithExistingSampleFilesMock.mockImplementation(() =>
      Promise.resolve(mockQuestionnaireNames),
    );
  });

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    mockIsProduction.mockReturnValue(false);
  });

  afterEach(() => {
    queryClient.clear();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  function wrapperWithPath(path: string) {
    return function PathWrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
        </QueryClientProvider>
      );
    };
  }

  it("App page matches snapshot", async () => {
    const { asFragment } = render(<App />, { wrapper });

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    let queryByText: ReturnType<typeof render>["queryByText"];

    await act(async () => {
      const renderResult = render(<App />, { wrapper });

      queryByText = renderResult.queryByText;
    });

    await waitFor(() => {
      expect(
        queryByText(
          /This is not a production environment. Do not upload any production data to this service./i,
        ),
      ).toBeInTheDocument();
      expect(
        queryByText(/Uploaded questionnaire samples with generated UACs/i),
      ).toBeInTheDocument();
      mockQuestionnaireNames.forEach(({ questionnaireName }) => {
        expect(queryByText(questionnaireName)).toBeInTheDocument();
      });
    });
  });

  it("view questionnaire page matches Snapshot in production", async () => {
    mockIsProduction.mockReturnValue(true);
    const { queryByText } = render(<App />, { wrapper });

    await waitFor(() => {
      expect(
        queryByText(
          /This environment is not a production environment. Do not upload any live data to this service./i,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("should show Links to manage UACs and history", async () => {
    let getAllByText: ReturnType<typeof render>["getAllByText"];

    await act(async () => {
      const renderResult = render(<App />, { wrapper });

      getAllByText = renderResult.getAllByText;
    });

    await waitFor(() => {
      expect(getAllByText("Disable UAC").length).toBeGreaterThan(0);
      expect(getAllByText("Enable UAC").length).toBeGreaterThan(0);
      expect(getAllByText("View UAC history").length).toBeGreaterThan(0);
    });
  });

  it("should render empty content when not logged in", async () => {
    mockAuthenticate.mockImplementationOnce(({ children }) =>
      children({ name: "" } as never, false, vi.fn()),
    );

    const { queryByText } = render(<App />, { wrapper });

    await waitFor(() => {
      expect(
        queryByText(/Uploaded questionnaire samples with generated UACs/i),
      ).not.toBeInTheDocument();
    });
  });

  it("should render a not found page for unknown routes", async () => {
    const { getByRole, getByText } = render(<App />, {
      wrapper: wrapperWithPath("/path-that-does-not-exist"),
    });

    await waitFor(() => {
      expect(getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
      expect(getByText("The page you're looking for doesn't exist.")).toBeInTheDocument();
      expect(getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
    });
  });
});
