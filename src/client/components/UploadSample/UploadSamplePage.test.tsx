import React from "react";
import {Router} from "react-router";
import {render, waitFor, fireEvent, cleanup, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {createMemoryHistory} from "history";
import UploadSamplePage from "./UploadSamplePage";


describe("Upload Sample Page", () => {

    it("select file page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <UploadSamplePage/>
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
                <UploadSamplePage/>
            </Router>
        );

        expect(queryByText(/Select instrument sample/i)).toBeInTheDocument();
    });

    it("should display an error message if you dont enter an instrument name", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <UploadSamplePage/>
            </Router>
        );

        await fireEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("Enter a valid instrument name")).toHaveLength(2);
        });
    });

    it("should display an error message if you dont select a file", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <UploadSamplePage/>
            </Router>
        );

        await fireEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("Select a file")).toHaveLength(2);
        });
    });
});