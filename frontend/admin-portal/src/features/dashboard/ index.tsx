
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Box } from "@mui/material";
import NodePoolTable from "../lightning-nodes/NodePoolTable";
import { useGetAllNodes } from "../lightning-nodes/hooks";

function createData(
  nodeId: string,
  apiEndpoint: string,
  gossipEndpoint: string,
  nodeLabel: string,
  tenantId: string,
  tier: string,
  pubkey: string
) {
  return { nodeId, apiEndpoint, gossipEndpoint, nodeLabel, tenantId, tier, pubkey };
}

const rows = [
  createData('18fa892f-3843-4273-a1b1-92900d2fb421', 'https://randy.ln.blockspaces.com', 'randy.ln.blockspaces.com:9743', 'Blocksapces', '67175bf4-fcd5-4c30-af42-36755fb81039', 'Free', '03faeea58ec1dbe8feb67df07b2ab23ee191bbbf65756682d3fa033d2575df84aa'),
];


const Dashboard = () => {
  const router = useRouter();
  const { data: nodes, isLoading: nodesLoading } = useGetAllNodes();

  useEffect(() => {
    console.log(nodes)
    if (!router.isReady) return;

  }, [nodes, router.isReady]);
  return (
    <>
      <Box sx={{ margin: "auto" }}>
        <NodePoolTable data={nodes as any} title={"All Nodes"} />
      </Box>
    </>
  );
};



export default Dashboard;