import { useActivateIntegration, useUpdateConnectorSettings } from "@platform/integrations/mutations";
import { useRouter } from "next/router";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { IntegrationContent, IntegrationStyles, Logo, LogoContainer, Name, StepWithName, Title } from "./integrations.styles";
import { useAccountConnector } from "@src/platform/hooks/integrations/queries";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Table, TableCell, TableRow, TextField } from "@mui/material";
import { ConnectorDto } from "@blockspaces/shared/dtos/integrations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Loading } from "@src/platform/components/common";

type AuthFormProps = {
  accountConnector: ConnectorDto;
  cancelAction: (cancel: boolean) => any;
  onSuccess: () => Promise<void>;
};
export const AuthForm = ({ accountConnector, cancelAction, onSuccess }: AuthFormProps) => {
  const router = useRouter();
  const { integrationId } = router.query;
  const [loadingOverride, setLoadingOverride] = useState(false);
  const { mutate: activateIntegration, isLoading: activatingIntegration } = useActivateIntegration();
  const { mutate: updateConnectorSettings, isLoading: updatingConnectorSettings, isSuccess: updatingConnectorSettingsSuccess } = useUpdateConnectorSettings();
  const { connector, isLoading } = useAccountConnector(accountConnector?.accountConnectorId);
  const { register, handleSubmit, reset, control, setValue } = useForm();

  useEffect(() => {
    if (isLoading) return;

    if (connector?.parameters?.length === 0) {
      // logic here
      updateConnectorSettings({ integrationId: integrationId.toString(), accountConnectorId: accountConnector?.accountConnectorId, updates: {} });
    }

    if (updatingConnectorSettings) {
      if (!loadingOverride) setLoadingOverride(true);
      return;
    }
    if (updatingConnectorSettingsSuccess) {
      onSuccess().then(() => {
        setLoadingOverride(false);
      });
    }
  }, [isLoading, connector, updatingConnectorSettings, updatingConnectorSettingsSuccess]);

  const onSubmit: SubmitHandler<any> = (data) => {
    updateConnectorSettings({ integrationId: integrationId.toString(), accountConnectorId: accountConnector?.accountConnectorId, updates: data });
  };

  if (isLoading || connector?.parameters?.length === 0) return <Loading when />;

  return (
    <Grid container justifyContent={"center"}>
      <Grid item xs={6}>
        <Box component={"form"} sx={{}} onSubmit={handleSubmit(onSubmit)}>
          <Loading when={isLoading || updatingConnectorSettings || loadingOverride} />
          {connector?.parameters
            ?.sort((prev, curr) => {
              return prev.DisplayOrder - curr.DisplayOrder;
            })
            .map((parameter, index) => {
              return (
                <Grid container justifyContent={"center"}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      {parameter.Values.length === 0 ? (
                        <>
                          <TextField
                            sx={{
                              "& .MuiFormLabel-root": {
                                marginLeft: "0px"
                              }
                            }}
                            required={!parameter.IsOptional}
                            label={parameter.Name}
                            {...register(parameter.TargetName, { required: !parameter.IsOptional })}
                            id={parameter.Id}
                            type={parameter.IsSensitive ? "password" : "text"}
                            placeholder={parameter.Name}
                          />
                        </>
                      ) : (
                        <Controller
                          name={parameter.TargetName}
                          control={control}
                          render={({ field: { onChange, value }, fieldState: { error }, formState }) => (
                            <TextField
                              label={parameter.Name}
                              id={parameter.Id}
                              select
                              {...register(parameter.TargetName, { required: true })}
                              sx={{
                                "& .MuiFormLabel-root": {
                                  marginLeft: "0px"
                                }
                              }}
                            >
                              {parameter.Values.map((value) => {
                                return (
                                  <MenuItem key={value} value={value}>
                                    {value}
                                  </MenuItem>
                                );
                              })}
                            </TextField>
                          )}
                        />
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              );
            })}

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button type="button" variant="contained" color="secondary" disabled={updatingConnectorSettings || loadingOverride} onClick={() => cancelAction(true)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={updatingConnectorSettings || loadingOverride} color="primary" onClick={() => handleSubmit(onSubmit)}>
              Save
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
