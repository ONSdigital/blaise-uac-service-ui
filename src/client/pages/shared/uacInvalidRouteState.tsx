import { Button, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface UacInvalidRouteStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function UacInvalidRouteState({
  message,
  actionLabel,
  onAction,
}: UacInvalidRouteStateProps): ReactElement {
  return (
    <Panel status="error">
      <p>{message}</p>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          primary={false}
          onClick={onAction}
        />
      )}
    </Panel>
  );
}

export default UacInvalidRouteState;
