import "@testing-library/jest-dom";

import type * as ReactModule from "react";

describe("Upload Sample invalid step coverage", () => {
  afterEach(() => {
    vi.doUnmock("react");
    vi.resetModules();
  });

  it("renders no step content when the active step is invalid", async () => {
    vi.doMock("react", async (importOriginal) => {
      const mod = await importOriginal<typeof ReactModule>();
      const realUseState = mod.useState.bind(mod);
      let useStateCallCount = 0;
      const createState = <T,>(
        initialState: T,
      ): [T, ReactModule.Dispatch<ReactModule.SetStateAction<T>>] => {
        useStateCallCount += 1;

        if (useStateCallCount === 3) {
          return [999 as T, vi.fn()];
        }

        return realUseState(initialState);
      };

      return { ...mod, useState: createState };
    });

    const { screen } = await import("@testing-library/react");
    const { MemoryRouter } = await import("react-router-dom");
    const { renderWithQueryClient } = await import("../../test-utils/renderWithQueryClient");
    const { default: UploadSample } = await import("./uploadSamplePage");

    renderWithQueryClient(
      <MemoryRouter>
        <UploadSample />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Which questionnaire needs UACs generated?/i)).toBeNull();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });
});
