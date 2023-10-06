import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useState } from "react";
import { isEqual } from "../services/services";
import { SC } from '../styles/tooltip.style';

const getBaseContent = (position, arrow, tooltip, style) => {
  let flex;
  switch (position) {
    case "left":
      flex = {
        alignItems: "center",
        justifyContent: "end"
      };
      break;
    case "right":
      flex = {
        alignItems: "center",
        justifyContent: "start"
      };
      break;

    case "top":
      flex = {
        alignItems: "end",
        justifyContent: "center"
      };
      break;

    case "bottom":
      flex = {
        alignItems: "start",
        justifyContent: "center"
      };
      break;

    default:
      break;
  }
  return(
    <div role="presentation" style={ {position: "absolute", display: "flex", ...flex }}>
      <SC.Frame $style={style} data-testid="frame-tooltip" arrow={arrow} className={`tooltip-${position}`}>
        <SC.Text>{tooltip}</SC.Text>
      </SC.Frame>
    </div>
  );
};

/** withContent is a HOC. Created to support the tooltip component.
 * - This is the fifth component of the chain.
 * - withHover(withWindowSize(withBox(withPositioning(withContent(withPortal(WithTooltip))))));
 * - It reacts to styles changes.
 * - If style changed, it will generate new jsx elements representing the tooltip.
 * - If box didn't change, it flips the isReady flag to true, nothing changed.
 * - It establishes the content state, with the assets, used by the withPortal to append to the dom.
 * - It accounts for the arrow prop, for tooltip styling.
 * - it establishes the content state.
 * - It relies on styles.
 */
export const withContent = <P extends { styles; arrow; tooltip; position; setIsReady; style; }>(
  WC,
  componentName = WC?.displayName ?? WC.name ?? WC?.type?.displayName
) => {
  const WithContent = (props: P) => {
    const { setIsReady, tooltip, style, arrow = true, styles, position = "bottom", ...rest } = props;

    const [baseContent, setBaseContent] = useState(getBaseContent(position, arrow, tooltip, style));
    const [content, setContent] = useState(<div style={{ position: "absolute", display: "block", ...styles }} />);

    useLayoutEffect(() =>
    {
      const base = getBaseContent(position, arrow, tooltip, style);
      setBaseContent(base);
      setContent(base);
      return () =>{};
    }, [ tooltip ]);

    useLayoutEffect(() => {
      if (content.props.style) {
        const { left, top, width, height } = content.props.style;
        const oldStyles = { left, top, width, height };
        if (!isEqual(oldStyles, styles)) {
          const newContent = React.cloneElement(baseContent, {
            style: { ...baseContent.props.style, ...styles }
          });
          setContent(newContent);
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      }
      return () => {};
    }, [styles, position, baseContent, content, setIsReady]);

    return <WC content={ content } tooltip={ tooltip} {...props} />;
  };

  WithContent.displayName = `withContent(${componentName})`;

  return observer(WithContent);
};
