import { useState } from "react";

import { getSampleFileWithUacs } from "../api/fileFunctions";

export default function useSampleFileDownload(questionnaireName: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  const downloadCsvFile = async () => {
    setLoading(true);
    setErrored(false);

    try {
      return await getSampleFileWithUacs(questionnaireName, `${questionnaireName}.csv`);
    } catch {
      setErrored(true);

      return [];
    } finally {
      setLoading(false);
    }
  };

  return { loading, errored, downloadCsvFile };
}
