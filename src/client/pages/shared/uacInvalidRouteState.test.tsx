import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import UacInvalidRouteState from "./uacInvalidRouteState";

describe("UacInvalidRouteState", () => {
  it("renders the error message without an action by default", () => {
    render(<UacInvalidRouteState message="Route state is invalid" />);

    expect(screen.getByText("Route state is invalid")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not render an action button when only the label is provided", () => {
    render(
      <UacInvalidRouteState
        message="Route state is invalid"
        actionLabel="Start again"
      />,
    );

    expect(screen.queryByRole("button", { name: "Start again" })).toBeNull();
  });

  it("renders the action button and invokes the handler when both action props are provided", () => {
    const onAction = vi.fn();

    render(
      <UacInvalidRouteState
        message="Route state is invalid"
        actionLabel="Start again"
        onAction={onAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start again" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
