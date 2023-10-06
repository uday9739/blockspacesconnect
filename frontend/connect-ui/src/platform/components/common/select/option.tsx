import Tooltip from '@mui/material/Tooltip';
import { observer } from 'mobx-react-lite';
import { useSelectStore } from './select-provider';
import { IOption } from './store/select-store';

type Props = {
  option: IOption
}

export const Option = observer(({ option }: Props) => {
  const {
    variation, selection, styles, multiSelect, handleSelection,
  } = useSelectStore();
  const {
    OptionWrap, OptionIcon, OptionLabel, OptionCheckBox, OptionContainerLabel,
  } = styles;
  return (
    <OptionWrap
      onClick={() => handleSelection(option)}
    >
      <OptionContainerLabel>
        {option.image
          && {
            default:
              <OptionIcon src={option.image} />,
            grid: (
              <Tooltip title={option.label} followCursor>
                <OptionIcon src={option.image} checked={selection === option} />
              </Tooltip>
            ),
          }[variation]}
        {
          {
            default:
              <OptionLabel>{option.label}</OptionLabel>,
            grid:
              <></>,
          }[variation]
        }
      </OptionContainerLabel>
      {multiSelect
        && {
          default:
            <OptionCheckBox type="checkbox" checked={selection === option} />,
          grid:
            <></>,
        }[variation]}
    </OptionWrap>
  );
});
