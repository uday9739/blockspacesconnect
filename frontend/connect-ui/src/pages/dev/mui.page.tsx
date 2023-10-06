
//
import { useEffect, useState } from "react";
//
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
//
import DevLayout from "@src/platform/components/layouts/dev-layout";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import TestThrowingError from "@src/features/dev-examples/components/test-thorwing-error";
import Tabs from "@src/features/dev-examples/components/tabs";
import AccordionExample from "@src/features/dev-examples/components/accordion";
import ButtonsExample from "@src/features/dev-examples/components/buttons";
import InputsExample from "@src/features/dev-examples/components/inputs";
import ChipExample from "@src/features/dev-examples/components/chip";
import CheckboxesExample from "@src/features/dev-examples/components/checkboxes"



const DevPage: NextPageWithLayout = () => {
  useEffect(() => {}, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px", margin: "auto", maxWidth: "75%" }}>
      {/* Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <ButtonsExample />
      </Box>
      {/* Inputs */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <InputsExample />
      </Box>
      {/*  Tabs*/}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <h1>Tabs</h1>
        <Tabs />
      </Box>
      {/* AccordionExample */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <h1>AccordionExample</h1>
        <AccordionExample />
      </Box>
      {/* ChipExample */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <h1>ChipExample</h1>
        <ChipExample />
      </Box>
      {/* CheckboxesExample */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <h1>CheckboxesExample</h1>
        <CheckboxesExample />
      </Box>
     
    </Box>
  );
};

export default DevPage;
DevPage.getLayout = function getLayout(page) {
  return <DevLayout>{page}</DevLayout>;
};
