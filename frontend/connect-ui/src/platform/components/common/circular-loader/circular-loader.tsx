import React from "react";

import { Styles } from "./styles";

const VIEW_SIZE = 44;
export type CircularLoaderProps = {
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  /**
   * The thickness of the circle.
   */
  thickness?: number;

  customStyle?: any;
};

export function CircularLoader({ ...props }: CircularLoaderProps) {
  const { Wrapper, Outer } = Styles;

  const { className, thickness, customStyle, ...rest } = props;
  const rootProps = {};

  let strokeDasharray;
  let strokeDashoffset;

  return (
    <Wrapper margin={customStyle.margin}>
      <Outer width={customStyle.width} height={customStyle.height} role="progressbar" {...rootProps} {...rest} style={{ height: customStyle.height, width: customStyle.width }}>
        <svg className="svg" viewBox={`${VIEW_SIZE / 2} ${VIEW_SIZE / 2} ${VIEW_SIZE} ${VIEW_SIZE}`}>
          <circle className="circle_two" cx={VIEW_SIZE} cy={VIEW_SIZE} r={(VIEW_SIZE - thickness) / 2} fill="none" strokeWidth={thickness} />
          <circle className="circle" style={{ strokeDasharray, strokeDashoffset }} cx={VIEW_SIZE} cy={VIEW_SIZE} r={(VIEW_SIZE - thickness) / 2} fill="none" strokeWidth={thickness} />
        </svg>
      </Outer>
    </Wrapper>
  );
}
CircularLoader.defaultProps = {
  thickness: 2.4,
  value: 0,
  color: "default",
  size: "small",
  customStyle: { width: "", height: "", margin: "" }
};
