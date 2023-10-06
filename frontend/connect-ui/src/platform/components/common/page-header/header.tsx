import { Cancel } from "@icons";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUIStore } from "@ui";

import Header, { Body, SectionTitle, ClickableTitle, Navigation, NavItem } from "./styles/header";

import { observer } from "mobx-react-lite";
export type HeaderProps = {
  title?: string;
};

const HEADER = observer(({ title }: HeaderProps) => {
  const userDropdown = useRef<HTMLDivElement>();

  const UI = useUIStore();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const Content = useMemo(() => {
    switch (router.pathname) {
      case "/connect/add-network":
        return (
          <Body>
            <SectionTitle>NETWORKS</SectionTitle>
            <Link href="/connect">
              <ClickableTitle
                onMouseOver={(e) =>
                  UI.addInfoTooltip({
                    id: "addNetwork",
                    label: "Click to close.",
                    parentComponentName: "Header",
                    target: e.target,
                    position: "right",
                    customStyle: { marginTop: "-1rem" }
                  })
                }
                onMouseLeave={(e) => UI.removeInfoTooltip("addNetwork")}
              >
                ADD NETWORK
                <Cancel />
              </ClickableTitle>
            </Link>
          </Body>
        );

      case "/connect":
        return (
          <Navigation>
            <NavItem data-nav-type="active">CONNECT</NavItem>
            <NavItem
              onMouseOver={(e) =>
                UI.addInfoTooltip({
                  id: "INTEGRATE",
                  label: "Coming Soon!",
                  parentComponentName: "Header",
                  target: e.target,
                  position: "bottom",
                  customStyle: { marginTop: "-1rem" }
                })
              }
              onMouseLeave={(e) => UI.removeInfoTooltip("INTEGRATE")}
            >
              INTEGRATE
            </NavItem>
          </Navigation>
        );
      case "/connect/cart": {
        return (
          <Body>
            <SectionTitle></SectionTitle>
            <Link href="/connect">
              <ClickableTitle>GET STARTED</ClickableTitle>
            </Link>
          </Body>
        );
      }

      default:
        return null;
    }
  }, [router.pathname]);

  useEffect(() => () => UI.removeInfoTooltipsByParentComponentName("Header"), [router.pathname]);
  useEffect(() => {
    setShowUserDropdown(false);
  }, [router.asPath]);

  const closeDropdown = useMemo(
    () => (e: MouseEvent & { target: HTMLElement }) => (userDropdown.current && e.target !== userDropdown.current && !userDropdown.current.contains(e.target) ? setShowUserDropdown(false) : false),
    [userDropdown.current]
  );

  useEffect(() => {
    showUserDropdown ? document.addEventListener("mousedown", closeDropdown) : document.removeEventListener("mousedown", closeDropdown), () => document.removeEventListener("mousedown", closeDropdown);
  }, [showUserDropdown]);

  return <Header>{Content}</Header>;
});

export default HEADER;
