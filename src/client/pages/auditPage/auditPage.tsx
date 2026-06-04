import { useQuery } from "@tanstack/react-query";
import {
  Button,
  ErrorBoundary,
  LoadingPanel,
  Panel,
  Table,
} from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import { getAuditLogs } from "../../api/auditLogs";
import { AUDIT_LOGS_QUERY_KEY } from "../../queryKeys";
import { type AuditLog } from "../../utils/auditLog.types";

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const day = twoDigits(date.getDate());
  const month = twoDigits(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = twoDigits(date.getHours());
  const minute = twoDigits(date.getMinutes());
  const second = twoDigits(date.getSeconds());

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

function AuditPage(): ReactElement {
  const {
    data: auditLogs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: AUDIT_LOGS_QUERY_KEY,
    queryFn: getAuditLogs,
  });

  let listError = "";

  if (error) {
    listError = "Unable to load UAC history.";
  } else if (auditLogs.length === 0 && !isLoading) {
    listError = "No recent UAC history found.";
  }

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-l"
    >
      <h1 className="ons-u-mb-l">UAC history</h1>
      <Button
        onClick={() => {
          void refetch();
        }}
        label="Reload"
        primary={true}
        small={true}
      />

      {isLoading && <LoadingPanel />}
      {!isLoading && listError !== "" && (
        <Panel
          status={listError.includes("Unable") ? "error" : "info"}
          spacious={true}
        >
          {listError}
        </Panel>
      )}
      {!isLoading && listError === "" && (
        <ErrorBoundary errorMessageText={"Failed to get UAC history"}>
          <Table
            columns={["Date and time", "Information"]}
            id={"audit-table"}
            scrollableLabel={"UAC history"}
          >
            {auditLogs.map(({ id, timestamp, severity, message }: AuditLog) => (
              <tr
                className="ons-table__row"
                key={id}
                data-testid="audit-table-row"
              >
                <td
                  className="ons-table__cell"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {formatDateTime(timestamp)}
                </td>
                <td className="ons-table__cell">
                  <span className={`ons-status ons-status--${severity.toLowerCase()}`}>
                    {message}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </ErrorBoundary>
      )}
    </main>
  );
}

export default AuditPage;
