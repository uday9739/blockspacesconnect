// framework
import React from "react";
// 3rd party
import { observer } from "mobx-react-lite";
// app code
import { NetworkStyles } from "./styles/network.styles";

type NetworkProps = {
  id: string;
  children: React.ReactNode;
};
export const Network = observer(({ id, children }: NetworkProps) => <NetworkStyles id={id}>{children}</NetworkStyles>);
