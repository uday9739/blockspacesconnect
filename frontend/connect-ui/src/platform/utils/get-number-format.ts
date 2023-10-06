import { UIStore } from "@ui";
import { v4 as uuid } from "uuid";
import numeral from "numeral";
import { MouseEvent } from "react";

export const getNumberFormat = (rawAmount: number, UI?: UIStore): [string, { onMouseOver: (e: MouseEvent) => void; onMouseLeave: (e: MouseEvent) => void }] => {
  const amount = Math.abs(rawAmount);

  let format;

  if (!format && amount >= 100000000000) format = "0,0a";

  if (!format && amount >= 10000000000) format = "0,0a";

  if (!format && amount >= 1000000000) format = "0.00a";

  if (!format && amount >= 100000000) format = "0,0a";

  if (!format && amount >= 10000000) format = "0.0a";

  if (!format && amount >= 1000000) format = "0.00a";

  if (!format && amount >= 100000) format = "0,0a";

  if (!format && amount >= 10000) format = "0.0a";

  if (!format) format = "0,0";

  const id = uuid();

  const tooltip =
    format !== "0,0" && UI
      ? {
        onMouseOver: (e) => {
          UI.addInfoTooltip({
            id,
            label: numeral(amount).format("0,0"),
            parentComponentName: "total",
            target: e.target,
            position: "top"
          });
        },
        onMouseLeave: (e) => UI.removeInfoTooltip(id)
      }
      : null;

  return [format, tooltip];
};
