import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Loading } from './loading';
import "jest-styled-components";
import renderer from "react-test-renderer";

describe("testing loading components hide and reveal feature", () => {
  test("it renders a correct snapshot", async () => {
    const tree = renderer.create(<Loading when={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("has rendered the correct component", () => {
    render(
      <div role="main">
        <Loading when={true} top="25px"></Loading>
      </div>
    );
    expect(screen.getByRole("presentation")).toHaveStyleRule("width: 15px");
  });
  test("should render <Loading /> when loading is set to true", async () => {
    const { container, getByTestId } = render(
      <div role="main">
        <Loading when={true} top="25px"></Loading>
      </div>
    );
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  test("should not render <Loading /> when loading is set to false, without a child; the function should return null", () => {
    const { container } = render(
      <div role="main">
        <Loading when={false} top="25px"></Loading>
      </div>
    );

    expect(screen.queryByRole("presentation")).toBeNull();
  });

  test("<Loading />  should be rendered when the boolean is set to true and should then remove itself from the DOM when the boolean changes to false, and the inner text does the opposite", async () => {
    const { rerender } = render(
      <div role="main">
        <Loading when={true} top="25px">
          hello
        </Loading>
      </div>
    );
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    expect(screen.queryByText("hello")).toBeNull();
    // re-render the same component with loading set to false
    rerender(
      <div role="main">
        <Loading when={false} top="25px">
          hello
        </Loading>
      </div>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  test("<Loading />  should hide the wrapped component, then un-hide it, then hide it again, then un-hide it again", async () => {
    const { rerender } = render(
      <div role="main">
        <Loading when={true}>
          <button title="here is the button" />
        </Loading>
      </div>
    );
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    // re-render the same component with loading set to false
    rerender(
      <div role="main">
        <Loading when={false}>
          <button title="here is the button" />
        </Loading>
      </div>
    );
    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.getByRole("button")).toBeInTheDocument();
    // re-render the same component with loading set to true
    rerender(
      <div role="main">
        <Loading when={true}>
          <button title="here is the button" />
        </Loading>
      </div>
    );
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    // re-render the same component with loading set to false
    rerender(
      <div role="main">
        <Loading when={false}>
          <button title="here is the button" />
        </Loading>
      </div>
    );
    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("<Loading />  should not let its wrapped component child be rendered when the boolean is set to true", async () => {
    const { container } = render(
      <div role="main">
        <Loading when={true} top="25px">
          <div data-testid="loading-child">Loading child</div>
        </Loading>
      </div>
    );
    expect(screen.queryByTestId("loading-child")).toBeNull();
  });
});

describe("testing loading components positioning, styles and dimensions", () => {
  test("the styles of the unmodified component should be correct", async () => {
    render(
      <div role="main" style={{ position: "absolute", width: 1000, height: 700 }}>
        <Loading when={true}>
          <button title="here is the button" />
        </Loading>
      </div>
    );
    const instanceLoading = screen.queryByRole("presentation");

    expect(instanceLoading).toHaveStyle("width: 100%");
    expect(instanceLoading).toHaveStyle("height: 100%");
    expect(instanceLoading).toHaveStyle("left: ");
    expect(instanceLoading).toHaveStyle("max-width: ");
    expect(instanceLoading).toHaveStyleRule("display: flex");
    expect(instanceLoading).toHaveStyleRule("height", "100%");
    expect(instanceLoading).toHaveStyleRule("align-items", "center");
    expect(instanceLoading).toHaveStyleRule("justify-content", "center");
    expect(instanceLoading).toHaveStyleRule("pointer-events", "none");
    expect(instanceLoading).toHaveStyleRule("user-select", "none");

    const rect = instanceLoading?.getBoundingClientRect();
    expect(rect?.left).toBe(0);
    expect(rect?.height).toBe(0);
    expect(rect?.width).toBe(0);
    expect(rect?.top).toBe(0);

    expect(instanceLoading).toHaveStyleRule("width", "80%", {
      modifier: "&::after"
    });
    expect(instanceLoading).toHaveStyleRule("background-size", "62.5rem 100%", {
      modifier: "&::after"
    });
  });

  test("should apply maxWidth correctly when set", async () => {
    render(
      <div role="main" style={{ position: "absolute", width: 1000, height: 700 }}>
        <Loading when={true} maxWidth="300">
          <button title="here is the button" />
        </Loading>
      </div>
    );

    const instanceLoading = screen.queryByRole("presentation");

    expect(instanceLoading).toHaveStyle("max-width: 300");
    expect(instanceLoading).toHaveStyleRule("max-width", "300");
  });

  test("should apply height and left correctly when set", async () => {
    render(
      <div role="main" style={{ position: "absolute", width: 1000, height: 700 }}>
        <Loading when={true} height="300" left="3rem">
          <button title="here is the button" />
        </Loading>
      </div>
    );

    const instanceLoading = screen.queryByRole("presentation");

    expect(instanceLoading).toHaveStyle("height: 300");
    expect(instanceLoading).toHaveStyle("left: 3rem");

    expect(instanceLoading).toHaveStyleRule("height", "300");
    expect(instanceLoading).toHaveStyleRule("left", "3rem");

    const rect = instanceLoading?.getBoundingClientRect();
    expect(rect?.left).toBe(0);
    expect(rect?.height).toBe(0);
    expect(rect?.x).toBe(0); // not sure why its not computing height here
    expect(rect?.width).toBe(0);
  });

  test("should accept provided position", async () => {
    const { rerender, queryByRole } = render(
      <div role="main" style={{ position: "absolute", width: 1000, height: 700 }}>
        <Loading when={true} left="100px" top="200px">
          <button title="here is the button" />
        </Loading>
      </div>
    );

    const instanceLoading = screen.queryByRole("presentation");

    expect(instanceLoading).toHaveStyle("left: 100px");
    expect(instanceLoading).toHaveStyle("top: 200px");
    expect(instanceLoading).toHaveStyleRule("left", "100px");
    expect(instanceLoading).toHaveStyleRule("top", "200px");
  });
});
