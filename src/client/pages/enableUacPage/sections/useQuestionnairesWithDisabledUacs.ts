import { useQuery } from "@tanstack/react-query";

import { type DisabledUacRow, getDisabledUacs } from "../../../api/disabledUacs";
import { DISABLED_UACS_QUERY_KEY } from "../../../query/queryKeys";

function useQuestionnairesWithDisabledUacs() {
  const { isLoading, isError, data } = useQuery({
    queryKey: DISABLED_UACS_QUERY_KEY,
    queryFn: (): Promise<DisabledUacRow[]> => getDisabledUacs(),
  });

  return {
    isLoading,
    isError,
    disabledUacRows: data ?? [],
  };
}

export default useQuestionnairesWithDisabledUacs;
