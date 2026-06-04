import { Button, LoadingPanel, Table } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import CsvDownloader from "react-csv-downloader";

import useSampleFileDownload from "../../shared/useSampleFileDownload";

import type { QuestionnaireFile } from "../../../questionnaire.types";

interface Props {
  uploadedSamples: QuestionnaireFile[];
  loading: boolean;
}

function QuestionnaireTableRow({ item, index }: { item: QuestionnaireFile; index: number }) {
  const { loading, errored, downloadCsvFile } = useSampleFileDownload(item.questionnaireName);

  const formattedDate = (() => {
    if (!item.lastModified) return "Unknown";
    const d = new Date(item.lastModified);
    const date = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${date} ${time}`;
  })();

  return (
    <React.Fragment>
      {errored && (
        <tr className="ons-table__row  ons-summary__item--error">
          <th
            colSpan={6}
            className="ons-summary__row-title u-fs-r"
          >
            Could not download {item.questionnaireName}.csv
          </th>
        </tr>
      )}
      <tr
        className={`ons-table__row ${errored ? "ons-summary__item--error" : ""}`}
        key={index}
        data-testid={"questionnaire-table-row"}
      >
        <td
          className="ons-table__cell"
          style={{ padding: "1rem" }}
        >
          {item.questionnaireName}
        </td>
        <td className="ons-table__cell">{formattedDate}</td>
        <td className="ons-table__cell">
          <CsvDownloader
            datas={downloadCsvFile}
            filename={`${item.questionnaireName}.csv`}
            bom={false}
          >
            <Button
              label={"Download"}
              primary={true}
              small={true}
              loading={loading}
            />
          </CsvDownloader>
        </td>
      </tr>
    </React.Fragment>
  );
}

const UploadedSamples = (props: Props): ReactElement => {
  const { uploadedSamples, loading } = props;

  if (loading) {
    return <LoadingPanel />;
  } else {
    const sortedList = [...uploadedSamples].sort(
      (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime(),
    );

    return (
      <>
        <div className="ons-u-mt-s">
          {
            <Table
              columns={["Questionnaire name", "Last modified date", "CSV file"]}
              id={"questionnaire-table"}
            >
              {sortedList.map((item: QuestionnaireFile, index: number) => (
                <QuestionnaireTableRow
                  key={item.questionnaireName}
                  item={item}
                  index={index}
                />
              ))}
            </Table>
          }
        </div>
      </>
    );
  }
};

export default UploadedSamples;
