import { useWindowSize } from "src/platform/hooks";
import { useMemo, useRef } from "react";
import { NetworkBackgroundStyles, Network, Networks, NetworkRow, Gradient } from "./styles/network-background.styled";
import { NetworkArray } from "@icons";

const NetworkIcons = NetworkArray;
/** Displays a background with animated blockchain network logos */
export function NetworkBackground() {
  const authBG = useRef(null);
  const windowSize = useWindowSize();

  const networkCount = NetworkIcons.length;
  const networkDimensions = {
    width: `${3 * windowSize.rem}px`,
    height: `${3 * windowSize.rem}px`,
    margin: `${0.25 * windowSize.rem}px`
  };

  const NetworkComponents = useMemo(() => {
    if (!authBG.current) return [];

    const rows = Array(Math.ceil(authBG.current.offsetHeight / (parseInt(networkDimensions.height) + 2 * parseInt(networkDimensions.margin)) + 2)).fill(null);
    const networksPerRow = Array(Math.ceil(authBG.current.offsetWidth / (parseInt(networkDimensions.width) + 2 * parseInt(networkDimensions.margin)) + 2)).fill(null);
    return rows.map((_, i) => (
      <NetworkRow
        key={`Auth-Network-Row-${i}`}
        style={{
          minHeight: `${parseInt(networkDimensions.height) + 2 * parseInt(networkDimensions.margin)}px`,
          marginLeft: `-${(i % 2) * (parseInt(networkDimensions.width) + parseInt(networkDimensions.margin))}px`
        }}
      >
        {networksPerRow.map((_, k) => {
          const NetworkIcon = NetworkIcons[0];

          let glowType;
          const animationDuration = 5;
          const animationRandomness = Math.ceil(Math.random() * 100);
          if (animationRandomness > 97) glowType = "a";
          else if (animationRandomness > 92) glowType = "b";
          else if (animationRandomness > 84) glowType = "c";

          return (
            <Network key={`Auth-Network-Icon-${i}-${k}`} data-glow-type={glowType} style={networkDimensions}>
              <NetworkIcon
                style={{
                  animationDuration: `${animationDuration}s`,
                  animationDelay: `${Math.random() * animationDuration - animationDuration}s`
                }}
              />
            </Network>
          );
        })}
      </NetworkRow>
    ));
  }, [authBG.current, windowSize]);

  return (
    <NetworkBackgroundStyles ref={authBG}>
      <Gradient />
      <Networks>{NetworkComponents}</Networks>
    </NetworkBackgroundStyles>
  );
}
