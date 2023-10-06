import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRangeStore } from '../';
import { Stage } from './stage';

const Component = React.forwardRef(({ children }: any, ref: any) => {
  const {
    componentFontSize,
    label,
    showDropDown,
    styles: { MenuWrap, MenuContainer, MenuLabel },
  } = useRangeStore();

  return (
    <MenuWrap
      ref={ref as React.RefObject<HTMLDivElement>}
      componentFontSize={componentFontSize}
    >
      <MenuContainer className="container-menu">
        {!showDropDown && <Stage />}
        {children}
      </MenuContainer>
      <MenuLabel className="label-input">{label}</MenuLabel>
    </MenuWrap>
  );
});
export const Menu = observer(Component);
