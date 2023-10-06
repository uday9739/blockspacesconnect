export {}
// import React from "react";
// import { useRouter } from "next/router";
// import { useUserStore } from "@platform/api";
// import { Button } from "@platform/common";
// import AddNetwork, { Network, Divider, Name, Logo, Description } from "./add-network.styles";
// import { NetworkId } from "@blockspaces/shared/models/networks";
// import { getAddNetworksLogoUri } from "./network-logos";
// import { useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
// import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
// import { useAddUserNetwork } from "@src/platform/hooks/user/mutations";

// const ADD_NETWORK = () => {
//   const router = useRouter();
//   const { catalog } = useNetworkCatalog();
//   const { data: user } = useGetCurrentUser();
//   const { mutate: addUserNetwork } = useAddUserNetwork();
//   const userStore = useUserStore();

//   const addNetworkConnection = async (networkId: string) => {
//     if (networkId === NetworkId.POCKET) {
//       await userStore.addNetworkConnection(networkId);
//       router.push("/connect");
//     } else {
//       router.push(`/connect/cart?network=${networkId}`);
//     }
//   };

//   return (
//     <AddNetwork>
//       {catalog.map((network) => {
//         const { name, description } = network;
//         const logoUri = getAddNetworksLogoUri(network._id);
//         const connected = !!user?.connectedNetworks?.find((networkId) => networkId === network._id);
//         const available = true;
//         return (
//           <Network key={`catalog-network-${network._id}`} connected={connected}>
//             <Logo src={logoUri} />
//             <Name>
//               <Divider />
//               {name}
//             </Name>
//             <Description>{description}</Description>
//             <Button
//               label={connected ? "CONNECTED" : available ? "CONNECT" : "COMING SOON"}
//               variation={connected || !available ? "simple" : "default"}
//               width="13rem"
//               height="2.5rem"
//               customStyle={{
//                 marginBottom: "1.25rem",
//                 borderWidth: "1px",
//                 fontSize: ".8125rem"
//               }}
//               disabled={connected || !available}
//               onClick={() => {
//                 !connected && addNetworkConnection(network._id);
//               }}
//             />
//           </Network>
//         );
//       })}
//     </AddNetwork>
//   );
// };

// export default ADD_NETWORK;
