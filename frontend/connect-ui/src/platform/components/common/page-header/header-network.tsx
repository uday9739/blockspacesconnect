import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Styles } from './styles/header-network.styles';

type Props = {
  slotLL: any;
  slotLR: any;
  slotUL?: any;
  slotUR?: any;
  logoNetwork: string;
  nameNetwork: string;
  navigationData: any;
  navigationState: string;
  setNavigationState: any;
};

export const HeaderNetwork = observer(({ slotLL, slotLR, slotUL, slotUR, logoNetwork, nameNetwork, navigationData, navigationState, setNavigationState }: Props) => {
  const { Header, Cap, Body, Logo, ModuleWrap, UpperModuleWrap, Navigation, HeaderBridge, LogoWrap, NetworkName, NavItems, NavItem } = Styles;

  const [navData, setNavData] = useState([]);

  useEffect(() => {
    setNavData(
      navigationData.map((item) => {
        if (item.value === navigationState) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        return item;
      })
    );
  }, [navigationState]);

  const changeNavigationState = (item) => {
    setNavigationState(item.value);
  };

  return (
    <Header>
      <Cap>
        <UpperModuleWrap>{slotUL}</UpperModuleWrap>
        <UpperModuleWrap>{slotUR}</UpperModuleWrap>
      </Cap>
      <Body>
        <ModuleWrap>{slotLL}</ModuleWrap>
        <Navigation>
          <HeaderBridge />
          <LogoWrap>
            <Logo src={ logoNetwork } alt={`${nameNetwork} logo` } />
          </LogoWrap>
          <NetworkName>{nameNetwork}</NetworkName>
          <NavItems>
            {navData &&
              navData.map((item, index) => (
                <NavItem key={index} selected={item.selected} onClick={() => changeNavigationState(item)}>
                  {item.label}
                </NavItem>
              ))}
          </NavItems>
        </Navigation>

        <ModuleWrap>{slotLR}</ModuleWrap>
      </Body>
    </Header>
  );
});
