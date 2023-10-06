import React, { useEffect } from "react";
import { Logo, FullLogo, Sync, Plus, Caret } from "@icons"
import Link from "next/link";
import { WrapperSidebar, Header, LogoWrap, Navigation, NavSection, NavSectionHeader, NavSectionHeaderLabel, SectionHeaderLogoWrap, NavSectionOption, OptionLabel, AddResource, ToggleSidebar } from './styles/sidebar.styles';
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { useUIStore } from "@ui";
import { getSideNavNetworksLogoUri } from "@platform/routes/networks/network-logos";
import { useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
import { isUserAuthenticated, useGetCurrentUser } from "@src/platform/hooks/user/queries";

const SideBarLogo = ({ network: { _id, name } }) => {
  const logoUri = getSideNavNetworksLogoUri(_id);
  return <img src={logoUri} alt={name} style={{ width: "3rem", height: "3rem", opacity: "0.3", transition: "100ms ease-out" }} />
}

export const Sidebar = observer(() => {
  const isLoggedIn = isUserAuthenticated();
  const router = useRouter();
  const { data:user } = useGetCurrentUser();
  const UI = useUIStore();
  const { getNetwork } = useNetworkCatalog()

  // Hack to remove sidebar on Lightning PoS page.
  if (router.pathname === "/multi-web-app/lightning/[tenantid]/pos" || router.pathname === "/multi-web-app/lightning/[tenantid]/[invoiceid]") return null;

  if (!isLoggedIn) return <></>;

  return (
    <>
      <WrapperSidebar data-expanded={UI.sidebarIsExpanded}>
        <ToggleSidebar onClick={() => UI.toggleSidebar()}>
          <Caret style={UI.sidebarIsExpanded ? { transform: 'rotate(90deg)' } : { transform: 'rotate(-90deg)' }} />
        </ToggleSidebar>
        <Header>
          <LogoWrap>{UI.sidebarIsExpanded ? <FullLogo /> : <Logo />}</LogoWrap>
        </Header>
        <Navigation>
          <NavSection>
            <Link href="/connect">
              <NavSectionHeader data-active={router.pathname === "/connect"}>
                <SectionHeaderLogoWrap>
                  <Sync />
                </SectionHeaderLogoWrap>
                <NavSectionHeaderLabel>Connect</NavSectionHeaderLabel>
              </NavSectionHeader>
            </Link>
            {user.connectedNetworks.map((networkId) => {

              const networkInfo = getNetwork(networkId);
              if (!networkInfo) return <></>
              return (
                <Link href={`/connect/${networkId}`} key={networkId}>
                  <NavSectionOption active={router.asPath === `/connect/${networkId}`}>
                    <SideBarLogo network={networkInfo} />
                    <OptionLabel>{networkInfo.name}</OptionLabel>
                  </NavSectionOption>
                </Link>
              );
            })}
            <Link href="/connect/add-network">
              <AddResource absolutelyPositioned={UI.sidebarIsExpanded} active={router.pathname === "/connect/add-network"}>
                <Plus />
              </AddResource>
            </Link>
          </NavSection>
        </Navigation>
      </WrapperSidebar>
    </>
  );
});
