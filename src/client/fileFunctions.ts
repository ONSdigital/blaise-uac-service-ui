import axios, { isAxiosError } from "axios";

import axiosConfig from "./axiosConfig";

import type { CsvDatas } from "./csv.types";
import type { QuestionnaireFile } from "./questionnaire.types";

export async function importUacsFromFile(file: File | undefined): Promise<number> {
  if (file === undefined) {
    throw new Error("file was not supplied");
  }

  const data = new FormData();

  data.append("file", file);

  const response = await axios.post("/api/v1/uac/import", data, axiosConfig());

  return response.data?.uacs_imported;
}

export async function disableUac(uac: string): Promise<boolean> {
  const response = await axios.post("/api/v1/uac/disable", { uac }, axiosConfig());

  return response.data === "Success";
}

export async function enableUac(uac: string): Promise<boolean> {
  const response = await axios.post("/api/v1/uac/enable", { uac }, axiosConfig());

  return response.data === "Success";
}

export async function generateUacsForSampleFile(
  questionnaireName: string | undefined,
  file: File | undefined,
  overwrite = false,
): Promise<boolean> {
  if (questionnaireName === undefined) {
    throw new Error("Questionnaire name was not supplied");
  }

  if (file === undefined) {
    throw new Error("file was not supplied");
  }

  const data = new FormData();

  data.append("fileName", getFileName(questionnaireName));
  data.append("file", file);
  data.append("overwrite", String(overwrite));

  await axios.post(`/api/v1/questionnaire/${questionnaireName}/uac/sample`, data, axiosConfig());

  return true;
}

export async function getSampleFileWithUacs(
  questionnaireName: string | undefined,
  fileName: string | undefined,
): Promise<CsvDatas> {
  if (questionnaireName === undefined) {
    throw new Error("Questionnaire name was not supplied");
  }

  if (fileName === undefined) {
    throw new Error("file name was not supplied");
  }

  const response = await axios.get(
    `/api/v1/questionnaire/${questionnaireName}/uac/sample/${fileName}`,
    axiosConfig(),
  );

  return response.data;
}

export async function sampleFileAlreadyExists(
  questionnaireName: string | undefined,
): Promise<boolean> {
  if (questionnaireName === undefined) {
    throw new Error("Questionnaire name was not supplied");
  }

  const fileName = getFileName(questionnaireName);

  try {
    const response = await axios.get(`/api/v1/file/${fileName}/exists`, axiosConfig());

    return response.data === true;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return false;
    }

    throw error;
  }
}

export async function getListOfQuestionnairesWithExistingSampleFiles(): Promise<
  QuestionnaireFile[]
> {
  const response = await axios.get("/api/v1/questionnaire-names", axiosConfig());

  return response.data;
}

export function getFileName(questionnaireName: string): string {
  return `${questionnaireName}.csv`;
}
