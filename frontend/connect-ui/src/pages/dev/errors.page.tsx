//
import { useEffect, useState } from "react";
//
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
//
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import TestThrowingError from "@src/features/dev-examples/components/test-thorwing-error";
import Tabs from "@src/features/dev-examples/components/tabs";
import AccordionExample from "@src/features/dev-examples/components/accordion";
import ButtonsExample from "@src/features/dev-examples/components/buttons";
import InputsExample from "@src/features/dev-examples/components/inputs";
import ChipExample from "@src/features/dev-examples/components/chip";
import DevLayout from "@src/platform/components/layouts/dev-layout";



const DevPage: NextPageWithLayout = () => {
  useEffect(() => {}, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px", margin: "auto", maxWidth: "75%" }}>
      {/* Example of ErrorBoundary using GenericComponentErrorFallback, catching an error  */}
      <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
        {/* neither of the 2 will render */}
        <TestThrowingError throwError={true} />
        <TestThrowingError throwError={false} />
      </ErrorBoundaryPlus>
      {/* Example of ErrorBoundary using GenericComponentErrorFallback, *** NO ERROR ***  */}
      <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
        <TestThrowingError throwError={false} />
      </ErrorBoundaryPlus>
    </Box>
  );
};

export default DevPage;
DevPage.getLayout = function getLayout(page) {
  return <DevLayout>{page}</DevLayout>;
};
