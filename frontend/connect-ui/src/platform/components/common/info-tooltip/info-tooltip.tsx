import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useUIStore } from "src/providers";

import InfoTooltipStyles, { Info, InfoLabel } from "./info-tooltip.styles";

export const InfoTooltip = observer(() => {
  const UI = useUIStore();

  const tooltips = useMemo(
    () =>
      UI.activeInfoTooltips.map((tooltip) => {
        const { id, target, position, label, customStyle } = tooltip;
        console.log("target=", target);
        let yPos = 0;
        let xPos = 0;
        switch (position) {
          case "top":
            xPos = target.getBoundingClientRect().left + target.offsetWidth / 2;
            yPos = target.getBoundingClientRect().top;
            break;

          case "right":
            xPos = target.getBoundingClientRect().left + target.offsetWidth;
            yPos = target.getBoundingClientRect().top + target.offsetHeight / 2;
            break;

          case "left":
            xPos = target.getBoundingClientRect().left;
            yPos = target.getBoundingClientRect().top + target.offsetHeight / 2;
            break;

          case "bottom":
            xPos = target.getBoundingClientRect().left + target.offsetWidth / 2;
            yPos = target.getBoundingClientRect().bottom;
            break;
        }
        return (
          <InfoTooltipStyles
            key={id}
            style={{
              top: `${yPos}px`,
              left: `${xPos}px`
            }}
          >
            <Info style={customStyle} data-position={position}>
              <InfoLabel>{label}</InfoLabel>
            </Info>
          </InfoTooltipStyles>
        );
      }),
    [new Set(UI.activeInfoTooltips)]
  );

  return <>{tooltips}</>;
});
