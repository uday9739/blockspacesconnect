import { observer } from "mobx-react-lite";
import React from "react";
import { Styles } from './styles/header-network.styles';
import CancelIcon from "@mui/icons-material/Cancel";
import { IconButton } from "../../common";
import Link from "next/link";

export type NavOption = { label: string; onClick: () => void; selected: boolean };
type Props = {
  slotLL: any;
  slotLR: any;
  slotUL?: any;
  slotUR?: any;
  network:any;
  navOptions: NavOption[];
};
export const NetworkHeader = observer(({ slotLL, slotLR, slotUL, slotUR, network, navOptions }: Props) => {
  const { Header, Cap, Body, ModuleWrap, UpperModuleWrap, Navigation, HeaderBridge, LogoWrap, Logo, NetworkName, NavItems, NavItem } = Styles;
  return (
    <Header>
      <Cap>
        <UpperModuleWrap>{slotUL}</UpperModuleWrap>
        <UpperModuleWrap>
          {slotUR}
          <Link href='/connect'>
            <IconButton Icon={CancelIcon} />
          </Link>
        </UpperModuleWrap>
      </Cap>
      <Body>
        <ModuleWrap>{slotLL}</ModuleWrap>
        <Navigation>
          <HeaderBridge />
          <LogoWrap>
            <Logo src={network?.logo} />
          </LogoWrap>
          <NetworkName>{network?.name}</NetworkName>
          <NavItems>
            {navOptions.map((nav, index) => (
              <NavItem id={nav.label} key={index} selected={nav.selected} onClick={nav.onClick}>
                {nav.label}
              </NavItem>
            ))}
          </NavItems>
        </Navigation>
        <ModuleWrap>{slotLR}</ModuleWrap>
      </Body>
    </Header>
  );
});
