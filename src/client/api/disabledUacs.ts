import axios from "axios";

import axiosConfig from "./axiosConfig";

export type DisabledUacRow = {
  questionnaire: string;
  caseId: string;
  uac: string;
};

export async function getDisabledUacs(): Promise<DisabledUacRow[]> {
  const response = await axios.get<DisabledUacRow[]>("/api/v1/disabled-uacs", axiosConfig());

  return response.data;
}
