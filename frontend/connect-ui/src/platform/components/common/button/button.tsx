import React, { ReactNode } from "react";
import Link from "next/link";
import { CircularLoader } from "@platform/common";
import { Styles } from "./style";

export type ButtonProps = {
  label: string;
  /**
   * TODO: [BSPLT-2383] make id required so e2e testing will work consistantly. this will require a refactor of 38 instanse where button is being called.
   */
  id?: string;
  /** Text flag for styling; TODO: Move to enumeration */
  variation?: "default" | "default-new" | "simple" | "simple-thin" | "default-thin" | "outlined" | "tab" | "toggle";
  labelOnSubmit?: string;
  selected?: boolean;
  /** URI button links to */
  href?: string;
  submitting?: boolean;
  /** Disable button interaction; defaults to false */
  disabled?: boolean;
  /** Set button type; defaults to 'button' */
  type?: "button" | "submit" | "reset" | "toggle";
  width?: string;
  height?: string;
  /** Apply custom styling; useful for minor adjustments - create new type for significant changes */
  customStyle?: any;
  onClick?: () => void;
  icon?: React.ReactElement;
  children?: ReactNode;
};

export const Button = ({
  type = "button",
  id,
  variation = "default",
  submitting = false,
  disabled = false,
  width = "21.25rem",
  height = "3.875rem",
  selected,
  onClick,
  href,
  label,
  labelOnSubmit,
  customStyle,
  icon,
  children
}: ButtonProps) => {
  const { Button } = Styles[variation];

  if (href) {
    return (
      <Link href={href}>
        <Button
          id={id}
          onClick={onClick}
          disabled={disabled || submitting}
          type={type}
          style={{
            width,
            minWidth: width,
            height,
            minHeight: height,
            ...customStyle
          }}
        >
          {icon}
          {label}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      id={id}
      selected={selected}
      onClick={onClick}
      disabled={disabled || submitting}
      submitting={submitting}
      type={type}
      style={{
        width,
        minWidth: width,
        height,
        minHeight: height,
        display: "flex",
        flexDirection: "row",
        gap: "0.5rem",
        ...customStyle
      }}
    >
      {submitting && <CircularLoader thickness={4} color="default" customStyle={{ margin: ".75rem .75rem .75rem -2rem", height: "1rem", width: "1rem" }} />}
      {submitting ? (
        labelOnSubmit
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
};
