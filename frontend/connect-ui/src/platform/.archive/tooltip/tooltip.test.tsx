import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BasicTooltip } from "./tooltip.composition";
import { Tooltip } from './tooltip';
import "@testing-library/jest-dom";
import "jest-styled-components";
import userEvent from "@testing-library/user-event";

function setup(jsx) {
  return {
    user: userEvent.setup({ delay: undefined }),
    ...render(jsx)
  };
}

describe("Testing the tooltip components setup, positioning and sizing.", () => {

  test("Should render with the correct button as a wrapped component.", () => {
    const { getByRole } = render(<BasicTooltip />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("Should have the tooltip role.", () => {
    const { getByRole } = render(<BasicTooltip />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  test("Should have the correct label.", () => {
    const { getByRole } = render(<BasicTooltip />);
    const rendered = screen.getByLabelText("this is the tooltip");
    expect(rendered).toBeTruthy();
  });

  test("Should have the correct id.", () => {
    const { getByRole } = render(<BasicTooltip />);
    const rendered = screen.getByRole("tooltip");
    expect(rendered.id.length).toBe(36);
  });

  test("Should not be in the dom initially.", () => {
    const { getByRole } = render(<BasicTooltip />);
    const rendered = screen.queryByText("tooltip-bottom");
    expect(rendered).toBeNull();
  });

  test("Should be in the dom after mouse over.", () => {
    const user = userEvent.setup();
    const { getByRole } = render(<BasicTooltip />);
    fireEvent.mouseOver(screen.getByRole("button"));
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  test("Should be at the bottom of the button by default.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow>
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.focus(screen.getByRole("button"));
    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByRole("presentation");
    fireEvent.resize(window);
    fireEvent.resize(window);
    fireEvent.mouseOver(screen.getByRole("button"));
    await fireEvent.resize(window);
    await fireEvent.mouseOver(screen.getByRole("button"));
    const tooltipRect = tooltip!.getBoundingClientRect();
    const button = screen.getByRole("button");
    const buttonRect = button.getBoundingClientRect();
    expect(tooltipRect.top).toBe(buttonRect.top + buttonRect.height);
    expect(tooltipRect.left).toBe(buttonRect.left);
  });

  test("Should be at the top when position top set.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow position="top">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );
    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByRole("presentation");
    const tooltipRect = tooltip!.getBoundingClientRect();
    const button = screen.getByRole("button");
    const buttonRect = button.getBoundingClientRect();
    expect(tooltipRect.top).toBe(buttonRect.top - tooltipRect.height);
    expect(tooltipRect.left).toBe(buttonRect.left);
  });

  test("Should be at the left when position left set.", async () => {
    const { user } = setup(
      <Tooltip tooltip="this is the tooltip" arrow position="left">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByRole("presentation");
    // eslint-disable-next-line testing-library/no-node-access
    expect(tooltip.firstChild).toHaveClass("tooltip-left");
    const tooltipRect = tooltip!.getBoundingClientRect();
    const button = screen.getByRole("button");
    const buttonRect = button.getBoundingClientRect();
    expect(tooltipRect.top).toBe(buttonRect.top);
    expect(tooltipRect.left).toBe(buttonRect.left - tooltipRect.width);
  });

  test("Should be at the right when position right is set.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow position="right">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );
    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByRole("presentation");
    expect(tooltip.firstChild).toHaveClass("tooltip-right");
    const tooltipRect = tooltip!.getBoundingClientRect();
    const button = screen.getByRole("button");
    const buttonRect = button.getBoundingClientRect();
    expect(tooltipRect.top).toBe(buttonRect.top);
    expect(tooltipRect.left).toBe(buttonRect.left + buttonRect.width);
  });

  test("Should be at the bottom when position bottom set.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow position="bottom">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByRole("presentation");
    // eslint-disable-next-line testing-library/no-node-access
    expect(tooltip.firstChild).not.toHaveClass("tooltip-right");
    const tooltipRect = tooltip!.getBoundingClientRect();
    const button = screen.getByRole("button");
    const buttonRect = button.getBoundingClientRect();
    expect(tooltipRect.top).toBe(buttonRect.top + buttonRect.height);
    expect(tooltipRect.left).toBe(buttonRect.left);
  });

  test("Should have an arrow when arrow prop is set to true.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="left">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );
    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByTestId("frame-tooltip");
    expect(tooltip).toHaveStyleRule("position", "absolute", {
      modifier: "&::before"
    });
    expect(tooltip).toHaveStyleRule("right", "-0.84rem", {
      modifier: "&.tooltip-left::before "
    });
  });

  test("Should not have an arrow when arrow prop is set to false.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow={false} position="left">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByTestId("frame-tooltip");
    expect(tooltip).not.toHaveStyleRule("position", "absolute", {
      modifier: "&::before"
    });
    expect(tooltip).not.toHaveStyleRule("right", "-0.84rem", {
      modifier: "&.tooltip-left::before "
    });
  });

  test("Should have the correct style for arrow on the right side.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="right">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByTestId("frame-tooltip");

    expect(tooltip).toHaveStyleRule("transform", "translate3d(-1.82rem,-50%,0)", {
      modifier: "&.tooltip-right::before "
    });
    expect(tooltip).toHaveStyleRule("border-right-color", "#5864e5", {
      modifier: "&.tooltip-right::before "
    });
  });

  test("Should have the correct style for arrow on the left side.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="left">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );
    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByTestId("frame-tooltip");

    expect(tooltip).toHaveStyleRule("transform", "translate3d(0,-50%,0)", {
      modifier: "&.tooltip-left::before "
    });
    expect(tooltip).toHaveStyleRule("border-left-color", "#5864e5", {
      modifier: "&.tooltip-left::before "
    });
  });
  test("Should have the correct style for arrow on the top side.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="top">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            top: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByTestId("frame-tooltip");
    expect(tooltip).toHaveStyleRule("transform", "translate3d(-50%,0,0)", {
      modifier: "&.tooltip-top::before "
    });
    expect(tooltip).toHaveStyleRule("border-top-color", "#5864e5", {
      modifier: "&.tooltip-top::before "
    });
  });

  test("Should have the correct style for arrow on the bottom side.", async () => {
    const { getByRole } = render(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
        <div
          role="button"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 100,
            bottom: 40
          }}
        >
          hello world!
        </div>
      </Tooltip>
    );

    fireEvent.mouseOver(screen.getByRole("button"));
    const tooltip = screen.getByTestId("frame-tooltip");
    expect(tooltip).toHaveStyleRule("transform", "translate3d(-50%,-1.24rem,0)", {
      modifier: "&.tooltip-bottom::before "
    });
    expect(tooltip).toHaveStyleRule("border-bottom-color", "#5864e5", {
      modifier: "&.tooltip-bottom::before "
    });
  });
});

describe("Testing focusing and blurring use cases.", () => {
  test("Should open upon focusing on the wrapped component, and hide when blurring.", async () => {
    const { getByRole } = render(
      <div role="main">
        <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
          <button
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              left: 50,
              bottom: 40
            }}
          >
            hello world!
          </button>
        </Tooltip>
      </div>
    );

    const tooltip = screen.queryByRole("presentation");
    expect(tooltip).not.toBeInTheDocument();
    screen.getByRole("button").focus();
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    screen.getByRole("button").blur();
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  test("Should close when it is focused and pressing the Escape key.", async () => {
    const { user } = setup(
      <div role="main">
        <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
          <button
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              left: 50,
              bottom: 40
            }}
          >
            hello world!
          </button>
        </Tooltip>
      </div>
    );

    screen.getByRole("button").focus();
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveFocus();
  });

  test("Pressing the tab key Should open it. and Escape key Should close it.", async () => {
    const { user } = setup(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
        <button
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            left: 50,
            bottom: 40
          }}
        >
          hello world!
        </button>
      </Tooltip>
    );
    await user.keyboard("{Tab}");
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  test("When hovering over the target and pressing Escape key, it Should close too.", async () => {
    const { user } = setup(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
        <button
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            left: 50,
            bottom: 40
          }}
        >
          hello world!
        </button>
      </Tooltip>
    );
    await user.hover(screen.getByRole("button"));
    expect(screen.getByRole("button")).not.toHaveFocus();
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  test("Clicking on the target, Should allow any click events go through. Tooltip Should not break buttons.", async () => {
    const handleClick = jest.fn();

    const { user } = setup(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
        <button
          onClick={handleClick}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            left: 50,
            bottom: 40
          }}
        >
          hello world!
        </button>
      </Tooltip>
    );
    await user.hover(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("The tooltip Should disappear when clicking on the button. And reappear on subsequent hover , or focus", async () => {
    const handleClick = jest.fn();
    const { user } = setup(
      <Tooltip tooltip="this is the tooltip" arrow={true} position="bottom">
        <button
          onClick={handleClick}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            left: 50,
            bottom: 40
          }}
        >
          hello world!
        </button>
      </Tooltip>
    );

    await user.hover(screen.getByRole("button"));
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button")).not.toHaveFocus();
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });
});
