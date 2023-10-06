import React from "react";
import { NetworkBackground } from "@src/platform/components/dashboards";
import { Alert } from "@mui/material";
import Link from "next/link";

export default function Error404() {
  return (
    <>
      <NetworkBackground />
      <div className="" style={{ margin: "auto", display: "flex", flexDirection: "column", alignContent: "center", justifyContent: "center", zIndex: 100 }}>
        <Alert severity="warning" variant="filled">
          <h1 style={{ textAlign: "center" }}>Uh oh, Page Not Found</h1>
        </Alert>
        <Link href={"/"} style={{ margin: "auto", paddingTop:"15px" }}>
          Click Here to go back home
        </Link>
      </div>
    </>
  );
}
