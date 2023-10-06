
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert, Box, Button } from "@mui/material";
import { useGetNodeInfo, usePingNodeInfo } from "./hooks";
import { useQueryClient } from "@tanstack/react-query";
import apiService from "src/platform/utils/apiService";
import Loading from "src/platform/components/Loading";


const NodePoolTable = ({ data, title }: NodePoolTableProps) => {
  const [nodeInfo, setNodeInfo] = useState({} as any);
  const [nodeApiIsLoading, setNodeApiIsLoading] = useState({} as any);
  const queryClient = useQueryClient();

  const handleOnClick = async (row: any) => {
    setNodeApiIsLoading((prevState: any, props: any) => ({ ...prevState, [row.nodeId]: true }));
    await queryClient.fetchQuery({ queryKey: ['node-info', row.nodeId], queryFn: () => apiService.get(`lnd/getinfo/${row.nodeId}`) });
    const data = queryClient.getQueryData(['node-info', row.nodeId]);
    setNodeInfo((prevState: any, props: any) => ({ ...prevState, [row.nodeId]: (data as any)?.message }));
    setNodeApiIsLoading((prevState: any, props: any) => ({ ...prevState, [row.nodeId]: false }));
  }



  return <Box sx={{ padding: "20px" }}>
    <h3 style={{ margin: "auto", textAlign: "center" }}>{title}</h3>
    <TableContainer  >
      <Table sx={{}} >
        <TableHead>
          <TableRow>
            <TableCell>Node Id</TableCell>
            <TableCell align="right">Tier</TableCell>
            <TableCell align="right">Label</TableCell>
            <TableCell align="right">Tenant Id</TableCell>
            <TableCell align="right">API Endpoint</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row) => (
            <TableRow
              key={`${row._id}-${row.nodeId}-${row.tenantId}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.nodeId}
              </TableCell>
              <TableCell align="right">{row.tier}</TableCell>
              <TableCell align="right">{row.nodeLabel}</TableCell>
              <TableCell align="right">{row.tenantId}</TableCell>
              <TableCell align="right">{row.apiEndpoint}</TableCell>
              <TableCell align="right">
                <Box sx={{ display: "flex", flexDirection: "column", maxWidth: '250px', margin: "auto" }}>
                  <Button onClick={() => handleOnClick(row)}>
                    {nodeInfo[row.nodeId] ? <> Refresh Info </> : <> Get Info</>}

                  </Button>
                  <Loading isLoading={nodeApiIsLoading[row.nodeId] === true} />
                  {nodeInfo[row.nodeId] ? <Alert sx={{}} severity="info" color="info">{nodeInfo[row.nodeId]}</Alert> : <></>}
                </Box>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer >
  </Box >
};

type LightningNodes = {
  _id: string,
  nodeId: string,
  apiEndpoint: string,
  gossipEndpoint: string,
  nodeLabel: string,
  tenantId: string,
  tier: string,
  pubkey: string
}
type NodePoolTableProps = {
  title: string,
  data: LightningNodes[]
};

export default NodePoolTable;