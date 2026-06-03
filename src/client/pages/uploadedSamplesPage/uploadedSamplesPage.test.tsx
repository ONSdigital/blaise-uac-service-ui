import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { getListOfQuestionnairesWithExistingSampleFiles } from "../../fileFunctions";
import { mockQuestionnaireNames } from "../../test-utils/api.mock";

import UploadedSamplesPage from "./uploadedSamplesPage";

import type { QuestionnaireFile } from "../../questionnaire.types";
import type { Mock } from "vitest";

vi.mock("../../fileFunctions");
const getListOfQuestionnairesWithExistingSampleFilesMock =
  getListOfQuestionnairesWithExistingSampleFiles as Mock<() => Promise<QuestionnaireFile[]>>;

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Questionnaire list page", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    getListOfQuestionnairesWithExistingSampleFilesMock.mockImplementation(() =>
      Promise.resolve(mockQuestionnaireNames),
    );
  });

  it("questionnaire list page matches Snapshot", async () => {
    const { asFragment } = render(<UploadedSamplesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(mockQuestionnaireNames[0]!.questionnaireName)).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("should render correctly", async () => {
    render(<UploadedSamplesPage />, { wrapper });

    await waitFor(() => {
      mockQuestionnaireNames.forEach(({ questionnaireName }) => {
        expect(screen.getByText(questionnaireName)).toBeInTheDocument();
      });
    });
  });

  it("should display an appropriate message if no samples are uploaded", async () => {
    getListOfQuestionnairesWithExistingSampleFilesMock.mockImplementation(() =>
      Promise.resolve([]),
    );

    render(<UploadedSamplesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/No questionnaire samples found./i)).toBeInTheDocument();
    });
  });

  it("should display an appropriate error message if service does not respond correctly", async () => {
    getListOfQuestionnairesWithExistingSampleFilesMock.mockImplementation(() => Promise.reject());

    render(<UploadedSamplesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load questionnaire samples./i)).toBeInTheDocument();
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    vi.resetModules();
    cleanup();
  });
});
