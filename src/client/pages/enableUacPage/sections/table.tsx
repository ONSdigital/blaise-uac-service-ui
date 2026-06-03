import { Button, Table } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import type { QuestionnaireWithDisabledUacs } from "../../../questionnaire.types";

interface Props {
  questionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs;
}

function TableSection({ questionnaireWithDisabledUacs }: Props): ReactElement {
  const questionnaireName = questionnaireWithDisabledUacs.questionnaireName;
  const navigate = useNavigate();

  const uacs = questionnaireWithDisabledUacs.disabledUacs.map((obj) => (
    <tr
      className="ons-table__row"
      data-testid="questionnaire-table-row"
      key={obj.uac}
    >
      <td className="ons-table__cell">{obj.case_id}</td>
      <td className="ons-table__cell">{obj.uac}</td>
      <td className="ons-table__cell">
        <Button
          label="Enable UAC"
          small={true}
          primary={true}
          onClick={() =>
            navigate("/enable-uac", {
              state: {
                step: "confirmation",
                questionnaireName,
                uac: obj.uac,
                case_id: obj.case_id,
              },
            })
          }
        />
      </td>
    </tr>
  ));

  return (
    <>
      <h1 className="ons-u-mt-m">
        Disabled UACs for{" "}
        <span>
          <em className="highlight">{questionnaireName}</em>
        </span>
      </h1>
      <Table
        columns={["Case ID", "UAC", "Enable"]}
        id="uac-table"
      >
        <>{uacs}</>
      </Table>
    </>
  );
}

export default TableSection;
