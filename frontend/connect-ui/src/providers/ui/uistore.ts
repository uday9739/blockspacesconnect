import { PlatformApiResponse } from "@blockspaces/shared/models/platform";
import { ToastProps } from "@platform/common";
// import { PlatformTransport } from "@src/platform/api/platform";
import { platformCheck } from "@platform/api/platform";
import { makeAutoObservable, runInAction } from "mobx";
import { SyntheticEvent } from "react";

type ParameterBlockState = { expanded: boolean }
type InfoTooltip = {
  id: string
  target: any
  parentComponentName: string
  position: 'top' | 'right' | 'bottom' | 'left'
  label: string
  customStyle?: any
  body?: string
}

export class UIStore {

  globalToastProps: ToastProps
  sidebarIsExpanded: boolean = false
  activeInfoTooltips: InfoTooltip[]
  parameterBlocks: {
    [connectionId: string]: {
      [blockPath: string]: ParameterBlockState
    }
  }
  env: 'prod' | 'dev' | 'stg' | 'local' = 'prod'
  isFetchingPlatformStatus = false;
  platformStatus: PlatformApiResponse = undefined;
  maintenanceModeOverride: boolean = false;
  maintenanceMode: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.parameterBlocks = {}
    this.activeInfoTooltips = [];
  }

  setEnv(env: 'prod' | 'dev' | 'stg' | 'local') {
    runInAction(() => (this.env = env));
  }

  registerConnectionParameterBlocks(connectionId: string, parameterBlocks: { [blockPath: string]: ParameterBlockState }) {
    this.parameterBlocks[connectionId] = {};
    Object.keys(parameterBlocks).forEach(blockPath => {
      this.parameterBlocks[connectionId][blockPath] = parameterBlocks[blockPath]
    });
  }

  setParameterBlockState(connectionId, blockPath: string, blockState: ParameterBlockState) {
    this.parameterBlocks[connectionId][blockPath] = blockState
  }



  /** Shows a toast message with the given properties. The {@link ToastProps.open} property will be ignored */
  showToast(props: ToastProps) {
    const onClose = (e: Event | SyntheticEvent) => {
      this.hideToast();

      if (props.onClose) props.onClose(e)
    }

    const newProps = { ...props, open: true, onClose }
    this.globalToastProps = newProps;
  }

  hideToast() {
    const newProps = { ...this.globalToastProps, open: false }
    this.globalToastProps = newProps;
  }



  addInfoTooltip(tooltip: InfoTooltip) {
    this.activeInfoTooltips.push(tooltip)
  }

  toggleSidebar() {
    this.sidebarIsExpanded = !this.sidebarIsExpanded
  }

  expandSidebar() {
    this.sidebarIsExpanded = true
  }

  collapseSidebar() {
    this.sidebarIsExpanded = false
  }

  removeInfoTooltip(tooltipId: string) {
    this.activeInfoTooltips = this.activeInfoTooltips.filter(tooltip => tooltip.id !== tooltipId)
  }

  updateInfoTooltip(tooltipId: string, updatedValues: InfoTooltip) {
    this.activeInfoTooltips = this.activeInfoTooltips.map(tooltip => tooltip.id === tooltipId ? updatedValues : tooltip)
  }

  removeInfoTooltipsByParentComponentName(parentName: string) {
    this.activeInfoTooltips = this.activeInfoTooltips.filter(tooltip => tooltip.parentComponentName !== parentName)
  }

  async platformCheck(maintenanceModeOverride: boolean = false) {
    try {

      runInAction(() => this.isFetchingPlatformStatus = true)
      const results = await platformCheck();
      runInAction(() => this.platformStatus = results.data)
      runInAction(() => {
        if (maintenanceModeOverride === false) this.maintenanceMode = (results.data.maintenanceMode === "maintenance")
        else {
          this.maintenanceModeOverride = true;
          this.maintenanceMode = false;
        }
      })
    } catch (error) {
      runInAction(() => {
        if (maintenanceModeOverride === false)
          this.maintenanceMode = true;
        else {
          this.maintenanceModeOverride = true;
          this.maintenanceMode = false;
        }
      })
    }
    finally {
      runInAction(() => this.isFetchingPlatformStatus = false)
    }

  }

}