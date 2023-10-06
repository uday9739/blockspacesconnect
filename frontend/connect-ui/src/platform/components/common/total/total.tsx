import { getFormattedNumber } from "src/platform/utils";
import { observer } from "mobx-react-lite";
import numeral from "numeral";
import { StyledTotal, Label, Amount, ChangeArrow, Change, ChangeWrap, ChangeAmt, ChangePct, AmountCentered } from "./total.styles";
import { Styles } from "@lightning/components/header/balance.styles"
import { LongArrow, Satoshi } from "@icons";
export type TotalProps = {
  label: string;
  amount: number;
  variation?: "default" | "centered";
  changedBy?: number;
  changedByPct?: number;
  fiat?: boolean
};
import { Tooltip } from "@platform/common";

/** Total is a presentational component, that displays a label, a formatted number and additionaly a percentage change number,
 * with an arrow indicating whether the amount went up or down.
 * It comes in two variations, default and centered.
 * Default is the variation that takes addinal props `changedBy` and `changedByPct` to render extra content.
 * Centered takes only label and amount, an djust diplays one centered number.
 * `numeral` library is used for formatting.
 * @see {@link TotalProps} */
export const Total = observer(({ label, amount, variation = "default", changedBy = 0, changedByPct = 0, fiat }: TotalProps) => {
  const { LogoWrap } = Styles

  let tooltipLabel;
  switch (label) {
    case "STARTING BALANCE":
      tooltipLabel = "Your balance at the beginning of the dates selected.";
      break;
    case "TOTAL MONEY IN":
      tooltipLabel = "The total amount received during the dates selected.";
      break;
    case "TOTAL MONEY OUT":
      tooltipLabel = "The amount you sent during the dates selected.";
      break;
    case "ENDING BALANCE":
      tooltipLabel = "Your balance at the end of the dates selected.";
      break;
    default:
      tooltipLabel = label;
      break;
  }

  const formattedAmount = fiat ? amount : getFormattedNumber(amount);

  const defaultBody = () => {
    return (
      <>
        <Tooltip placement="bottom" content={numeral(amount)}>
          <Amount>{fiat ? "$" : <Satoshi color="black"/>}{formattedAmount}</Amount>
        </Tooltip>
        {!!changedBy && (
          <ChangeWrap increased={changedBy > 0}>
            <ChangeArrow>
              <LongArrow />
            </ChangeArrow>
            <Change>
              <ChangeAmt>{numeral(changedBy).format("0,0")}</ChangeAmt>
              <ChangePct>{numeral(changedByPct).format("0,0.00")}%</ChangePct>
            </Change>
          </ChangeWrap>
        )}
      </>
    );
  };

  const centeredBody = (
    <Tooltip content={tooltipLabel}>
      <AmountCentered>{fiat ? "$" : <LogoWrap><Satoshi color="black"/></LogoWrap>}{formattedAmount}</AmountCentered>
    </Tooltip>
  );

  return (
    <StyledTotal>
      <Label>{label}</Label>
      {
        {
          default: defaultBody(),
          centered: centeredBody
        }[variation]
      }
    </StyledTotal>
  );
});
