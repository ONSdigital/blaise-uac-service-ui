import { useQuery } from "@tanstack/react-query";

import { DISABLED_UACS_QUERY_KEY } from "../../../query/queryKeys";

import useQuestionnairesWithDisabledUacs from "./useQuestionnairesWithDisabledUacs";

import type { Mock } from "vitest";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("useQuestionnairesWithDisabledUacs", () => {
  it("uses disabled UACs query key", () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    useQuestionnairesWithDisabledUacs();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: DISABLED_UACS_QUERY_KEY }),
    );
  });
});
