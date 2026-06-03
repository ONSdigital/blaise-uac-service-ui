import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import axiosConfig from "../../../axiosConfig";

export type DisabledUacRow = {
  questionnaire: string;
  caseId: string;
  uac: string;
};

function useQuestionnairesWithDisabledUacs() {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["all-disabled-uacs"],
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
