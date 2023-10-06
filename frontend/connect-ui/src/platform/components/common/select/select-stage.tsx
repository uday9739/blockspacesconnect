import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useSelectStore } from './select-provider';
import { IOption } from './store/select-store';

export const SelectStage = observer(() => {
  const {
    multiSelect, selection, selections, styles, toggleDropDown, removeFromSelectedOptions,
  } = useSelectStore();

  const {
    MenuSelection, WrapStage, Stage, PillComponent,
  } = styles;

  return (
    <>
      {
        !multiSelect ?
          <MenuSelection
            onClick={toggleDropDown}>
            {(selection as IOption)?.label}
          </MenuSelection>
          : !isEmpty(selections) ?
            <WrapStage onClick={toggleDropDown}>
              <Stage >
                {selections.map((selection, index) => (
                  <PillComponent>
                    <div className="container-label-pill">{selection.label}</div>
                    <img src='images/select/pill-close.svg' onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromSelectedOptions(selection); }} />
                  </PillComponent>
                ))}
              </Stage>
            </WrapStage> :
            <MenuSelection onClick={toggleDropDown}>Select</MenuSelection>
      }
    </>
  );
});
