//
import { useEffect, useState } from "react";
//
import { Box, Paper } from "@mui/material";
//
import { NextPageWithLayout } from "@platform/types/base-page-props";
import DevLayout from "@src/platform/components/layouts/dev-layout";
import Link from "next/link";

const DevPage: NextPageWithLayout = () => {
  useEffect(() => {}, []);

  return <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px", margin: "auto", maxWidth: "75%" }}>
    <ul>
      <li><Link href={"/dev/mui"}> @MUI Examples</Link></li>
      <li><Link href={"/dev/errors"}> Error Examples</Link></li>
    </ul>
  </Box>;
};

export default DevPage;
DevPage.getLayout = function getLayout(page) {
  return <DevLayout>{page}</DevLayout>;
};
