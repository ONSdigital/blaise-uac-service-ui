import { Table } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { Link } from "react-router-dom";

import type { QuestionnaireWithDisabledUacs } from "../../../questionnaire.types";

interface Props {
  questionnaireWithDisabledUacs: QuestionnaireWithDisabledUacs;
}

function TableSection({ questionnaireWithDisabledUacs }: Props): ReactElement {
  const questionnaireName = questionnaireWithDisabledUacs.questionnaireName;

  const uacs = questionnaireWithDisabledUacs.disabledUacs.map((obj) => (
    <tr
      className="ons-table__row"
      data-testid="questionnaire-table-row"
      key={obj.uac}
    >
      <td className="ons-table__cell">{obj.case_id}</td>
      <td className="ons-table__cell">{obj.uac}</td>
      <td className="ons-table__cell">
        <Link
          to="/enable-uac"
          state={{ step: "confirmation", questionnaireName, uac: obj.uac, case_id: obj.case_id }}
          className="ons-breadcrumb__link"
          aria-label={`Enable UAC ${obj.uac}`}
        >
          Enable UAC
        </Link>
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
