import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import axiosConfig from "../../../axiosConfig";
import { DISABLED_UACS_QUERY_KEY } from "../../../queryKeys";

export type DisabledUacRow = {
  questionnaire: string;
  caseId: string;
  uac: string;
};

function useQuestionnairesWithDisabledUacs() {
  const { isLoading, isError, data } = useQuery({
    queryKey: DISABLED_UACS_QUERY_KEY,
    queryFn: async () => {
      const response = await axios.get<DisabledUacRow[]>("/api/v1/disabled-uacs", axiosConfig());

      return response.data;
    },
  });

  return {
    isLoading,
    isError,
    disabledUacRows: data ?? [],
  };
}

export default useQuestionnairesWithDisabledUacs;
