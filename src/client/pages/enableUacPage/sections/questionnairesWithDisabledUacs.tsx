import { Button, LoadingPanel, Panel, Table } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import useQuestionnairesWithDisabledUacs from "./useQuestionnairesWithDisabledUacs";

import type { DisabledUacRow } from "./useQuestionnairesWithDisabledUacs";

function QuestionnairesWithDisabledUacs(): ReactElement {
  const navigate = useNavigate();
  const { isLoading, isError, disabledUacRows } = useQuestionnairesWithDisabledUacs();

  if (isLoading) {
    return <LoadingPanel message="Getting disabled UACs for active questionnaires..." />;
  }

  return (
    <div className="ons-u-mt-s">
      {disabledUacRows.length > 0 ? (
        <Table
          columns={["Questionnaire name", "Case ID", "UAC", "Actions"]}
          id={"disabled-uacs-table"}
        >
          {disabledUacRows.map((row: DisabledUacRow) => (
            <tr
              className="ons-table__row"
              key={`${row.questionnaire}-${row.caseId}-${row.uac}`}
              data-testid={"disabled-uac-row"}
            >
              <td className="ons-table__cell ons-u-p-s">{row.questionnaire}</td>
              <td className="ons-table__cell">{row.caseId}</td>
              <td className="ons-table__cell">{row.uac}</td>
              <td className="ons-table__cell">
                <Button
                  label="Enable UAC"
                  small={true}
                  onClick={() =>
                    navigate("/enable-uac", {
                      state: {
                        step: "confirmation",
                        questionnaireName: row.questionnaire,
                        uac: row.uac,
                        case_id: row.caseId,
                      },
                    })
                  }
                  primary={true}
                />
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <Panel
          status={isError ? "error" : "info"}
          spacious={true}
        >
          {isError
            ? "Unable to retrieve disabled UACs"
            : "There are no disabled UACs for active questionnaires."}
        </Panel>
      )}
    </div>
  );
}

export default QuestionnairesWithDisabledUacs;
