import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";

import { StyledNetworkSync, Title, Copy, StepButton, LoadingBar, Nub } from "./network-sync.styles";

import { LightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { SetupSteps } from "@lightning/types";
import { useUIStore } from "@ui";
import { useHeyhowareya, useNodeDoc } from "@lightning/queries";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { getMacaroon } from "@lightning/api";
import { useGenerateBscMacaroon, useInitializeNode } from "../../hooks/mutations";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  next: () => void;
  setup: LightningSetup;
  setSetup: any;
};

type PageData = {
  nodeDoc: ApiResult<LightningNodeReference>;
  loading: boolean;
  error: any;
  refetch: any;
  invalidateCache: () => void;
};

const usePageData = (): PageData => {
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc();
  const { refetch, invalidateCache } = useHeyhowareya();

  return {
    nodeDoc,
    loading: nodeDocLoading,
    error: nodeDocError,
    refetch,
    invalidateCache
  };
};

export const NetworkSync = observer(({ next, setup, setSetup }: Props) => {
  const barCount = 20;
  const barHeight = 2;
  const router = useRouter();
  const UI = useUIStore();
  const queryClient = useQueryClient();
  const { nodeDoc, loading: pageDataLoading, error, refetch, invalidateCache } = usePageData();
  const { initializeNodeFunc, data: initializeNodeData, isLoading: initializeNodeLoading, error: initializeNodeError } = useInitializeNode();
  const { generateBscMacaroon, bscMac, bscLoading, bscMacError, bscMacIsError } = useGenerateBscMacaroon();
  const [loaded, setLoaded] = useState(false);
  const [setupError, setSetupError] = useState(false);
  const [activeBar, setActiveBar] = useState(0);
  const [addVaultMacToStorageSuccessResult, setAddVaultMacToStorageResult] = useState(false);
  const [triggerCreateBSCMacaroonAdminMacaroon, setTriggerCreateBSCMacaroonAdminMacaroon] = useState(false);
  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => <Nub selected={i === activeBar} />), [activeBar]);

  // handle comp mount
  useEffect(() => {
    if ((!setup.password || setup.seed.length === 0) && !nodeDoc) router.replace("/multi-web-app/lightning/setup");
  }, []);

  useEffect(() => {
    if (loaded) return;
    const loadingAnimation = setTimeout(() => {
      let nextBar = activeBar + 1;
      if (nextBar > barCount - 1) nextBar = 0;
      setActiveBar(nextBar);
    }, 80);
    return () => clearTimeout(loadingAnimation);
  }, [activeBar]);

  // handle page data load compete
  useEffect(() => {
    if (pageDataLoading || loaded) return;
    initializeNode();
  }, [pageDataLoading, loaded]);

  // handle initializeNodeData complete
  useEffect(() => {
    if (!initializeNodeData || initializeNodeError || initializeNodeLoading || addVaultMacToStorageSuccessResult) return;
    if (initializeNodeError) return issueSettingUpNodeToast();
    refetch();
    setTriggerCreateBSCMacaroonAdminMacaroon(true);
  }, [initializeNodeData, initializeNodeLoading]);

  // handle generateBscMacaroon
  useEffect(() => {
    if (pageDataLoading || !triggerCreateBSCMacaroonAdminMacaroon) return;
    generateBscMacaroon({ url: setup.url, nodeId: setup.nodeId });
    //clear
    // invaldateCache();
  }, [triggerCreateBSCMacaroonAdminMacaroon, pageDataLoading]);

  // handle generateBscMacaroon complete
  useEffect(() => {
    if (bscMacIsError && initializeNodeData) {
      setSetupError(true);
      setLoaded(true);
      return issueSettingUpNodeToast();
    }
    if (bscLoading || loaded) return;
    setLoaded(true);
  }, [bscLoading, initializeNodeData]);

  const issueSettingUpNodeToast = () => {
    return UI.showToast({
      message: "There was an issue setting up your node. Contact a customer support agent.",
      alertType: "error",
      position: {
        horizontal: "right",
        vertical: "top"
      },
      autoHideDuration: 5000
    });
  };

  // Uses encrypted mac in vault, decrypts it, stores in browser
  const addVaultMacToStorage = async () => {
    try {
      await getMacaroon(setup.password, nodeDoc?.data?.nodeId);
      return true;
    } catch (e) {
      return false;
    }
  };

  const initializeNode = async () => {
    if (triggerCreateBSCMacaroonAdminMacaroon || pageDataLoading) return;
    // Step 1: Attempt to decrypt existing mac as if it is in vault
    const success = await addVaultMacToStorage();
    setAddVaultMacToStorageResult(success);
    if (setup.url === "") {
      setSetup({ ...setup, url: nodeDoc?.data.apiEndpoint, nodeId: nodeDoc?.data.nodeId });
    }
    if (!success) {
      // Initialize node with seed + passphrase
      if (!setup.password) return router.replace({ pathname: "/multi-web-app/lightning", query: { setup: SetupSteps.MissingPassword } });
      initializeNodeFunc({ url: setup.url, seed: setup.seed, password: setup.password });
    } else {
      setTriggerCreateBSCMacaroonAdminMacaroon(true);
    }
  };

  return (
    <StyledNetworkSync>
      <Title>Syncing to Network</Title>
      <Copy>
        Almost done - we’re connecting your Node to the network <br />
        This shouldn’t take long...
      </Copy>
      {loaded ?
        setupError ?
          <Title>Failed to setup Bitcoin Invoicing & Payments. Please wait and try again.</Title> :
          <Title>Finished setting up Bitcoin Invoicing & Payments!</Title> : <LoadingBar height={barHeight}>{bars.map((nub) => nub)}</LoadingBar>}
      <StepButton id="btnLncSyncing" margin={"3rem auto 3.25rem"} width={"16rem"} disabled={!loaded} onClick={() => {
        queryClient.invalidateQueries(["heyhowareya"])
      }}>
        Finish
      </StepButton>
    </StyledNetworkSync>
  );
});
