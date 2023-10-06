import { FormControl, FormGroup, Switch } from "@mui/material"
import { StyledSettings, Body, Header, Title, SettingsPanel, StyledSetting } from "./settings.styles"
import React, { useEffect, useState } from "react";
import { useGetCurrentUser, useIsUserFeatureEnabled } from "@platform/hooks/user/queries";
import { useUpdateUserAppSettings } from "@platform/hooks/user/mutations"
import { Button, CopyText, TextInput } from "@src/platform/components/common";
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags";
import { useCheckQuickBooksIntegrationForTenant } from "@lightning/queries";
import { useResetNode, useUpdateNodeDoc } from "@lightning/mutations";
import { useUIStore } from "@src/providers";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { IsNotEmpty } from "class-validator";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

const DefaultToBip = () => {
  const { data: user } = useGetCurrentUser()
  const { mutate: updateAppSettings } = useUpdateUserAppSettings()
  const onDefaultToBip = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      updateAppSettings({ defaultPage: '/multi-web-app/lightning' })
    } else {
      updateAppSettings({ defaultPage: '/connect' })
    }
  }
  return (
    <FormControl component="fieldset" variant="standard">
      <FormGroup>
        <Switch id="defaultToBip" size="medium" checked={user.appSettings?.defaultPage === "/multi-web-app/lightning"} onChange={onDefaultToBip} />
      </FormGroup>
    </FormControl>
  );
}
const CurrencySwitch = () => {
  const { data: user } = useGetCurrentUser()
  const { mutate: updateAppSettings } = useUpdateUserAppSettings()
  const onChangeCurrency = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateAppSettings({ bip: { displayFiat: event.target.checked } })
  }
  return (
    <FormControl component="fieldset" variant="standard">
      <FormGroup>
        <Switch id="chkChangeCurrency" size="medium" checked={user.appSettings?.bip?.displayFiat} onChange={onChangeCurrency} />
      </FormGroup>
    </FormControl>
  )
}

const ErpInvoiceEmailTemplate = () => {
  const { data: user } = useGetCurrentUser()
  const tenantId = user?.activeTenant?.tenantId;
  const isUserFeatureEnabled = useIsUserFeatureEnabled();
  const isCyclrEnabled = isUserFeatureEnabled(FeatureFlags.cyclrUserBIP);
  const host = process?.env?.HOST_URL ?? 'https://localhost';
  // TODO: Paramaterize this for a different domain.
  const cyclerLink = `${host}/multi-web-app/lightning/erp?tenantId=${tenantId}&erpId=[Invoice No.]&domain=QBO`;
  const legacyQboLink = `${host}/multi-web-app/lightning/quickbooks?tenantId=${tenantId}&erpId=[Invoice No.]`
  const link = isCyclrEnabled ? cyclerLink : legacyQboLink

  return (
    <FormControl component="fieldset" variant="standard">
      <FormGroup style={{ gap: '1rem' }}>
        <CopyText label="Payment Link" text={link} style={{ width: "30rem", height: "3.5rem" }} fontSize={1.1} />
      </FormGroup>
    </FormControl>
  )
}
class NodeLabelChangeDto {
  @IsNotEmpty({ message: "Password is required" })
  companyName: string;
}

const ChangeNodeLabel = () => {
  const ui = useUIStore()
  const resolver = classValidatorResolver(NodeLabelChangeDto)
  const { mutateAsync: updateNodeDoc, isSuccess } = useUpdateNodeDoc()
  const [changing, setChanging] = useState(false)
  const form = useForm<NodeLabelChangeDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  })

  useEffect(() => {
    if (!isSuccess) return
    setChanging(false)
    form.reset()
    ui.showToast({
      alertType: "success",
      message: "Node label updated successfully",
      position: {
        vertical: "top",
        horizontal: "right"
      }
    })
  }, [isSuccess])
  form.watch()

  const updateNodeLabel = async (event) => {
    event.preventDefault()
    const label = form.getValues("companyName")
    await updateNodeDoc({ nodeUpdate: { nodeLabel: label } })
  }

  return (
    <>
      <div style={{ display: changing ? "flex" : "none", flexDirection: "row", alignItems: "center" }}>
        <form onSubmit={updateNodeLabel}>
          <TextInput
            register={form.register}
            name="companyName"
            label="Company name"
            value={form.getValues("companyName")}
          />
        </form>
        <Button label="Confirm" variation="simple" width="8rem" height="3rem" customStyle={{ marginLeft: "1rem" }} onClick={() => updateNodeDoc({ nodeUpdate: { nodeLabel: form.getValues("companyName") } })} />
      </div>
      <div style={{ display: changing ? "none" : undefined }}>
        <Button label="Update" variation="simple" width="10rem" height="3rem" onClick={() => setChanging(true)} />
      </div>
    </>
  )
}

const ResetNode = () => {
  const { mutate: resetNode, isSuccess, isLoading } = useResetNode()
  const ui = useUIStore()

  return (
    <FormControl component="fieldset" variant="standard">
      <FormGroup style={{ gap: '1rem' }}>
        <Button label="RESET NODE" variation="simple" width="10rem" height="3rem" onClick={() => resetNode()} submitting={isLoading} labelOnSubmit="Resetting" />
      </FormGroup>
    </FormControl>
  )
}

export const Settings = () => {
  const router = useRouter()
  const isBip = router.query.nid === "lightning"
  const { data: user } = useGetCurrentUser()
  const isUserFeatureEnabled = useIsUserFeatureEnabled();
  const isCyclrEnabled = isUserFeatureEnabled(FeatureFlags.cyclrUserBIP);
  const { data: isLegacyQuickBooksEnabled } = useCheckQuickBooksIntegrationForTenant(user.activeTenant.tenantId)
  const prod = process.env.HOST_URL === "https://app.blockspaces.com"

  return (
    <StyledSettings>
      <Body>
        <Header>
          <Title>SETTINGS</Title>
        </Header>
        <SettingsPanel>
          {isBip &&
            <StyledSetting>
              <h1>Change node name</h1>
              <ChangeNodeLabel />
            </StyledSetting>
          }
          <StyledSetting>
            <h1>Display currency in USD</h1>
            <CurrencySwitch />
          </StyledSetting>
          <StyledSetting>
            <h1>Automatically launch {isBip ? "BIP" : "Lightning Reporter"} on login</h1>
            <DefaultToBip />
          </StyledSetting>
          {(isCyclrEnabled || isLegacyQuickBooksEnabled) &&
            <StyledSetting>
              <h1>QuickBooks Invoice Email Template</h1>
              <ErpInvoiceEmailTemplate />
            </StyledSetting>
          }
          {!prod && isBip &&
            <StyledSetting>
              <h1>Reset Node</h1>
              <ResetNode />
            </StyledSetting>
          }
        </SettingsPanel>
      </Body>
    </StyledSettings>
  )
}

