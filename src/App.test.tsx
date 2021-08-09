import React from "react";
import {render, waitFor, screen} from "@testing-library/react";
import App from "./App";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import "@testing-library/jest-dom";

describe("React homepage", () => {

    it("view instrument page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        const {queryByText} = render(
            <Router history={history}>
                <App/>
            </Router>
        );

        expect(queryByText(/This is a landing page/i)).toBeInTheDocument();
    });
});
