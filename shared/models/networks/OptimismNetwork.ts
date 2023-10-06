import { IGatewayNetwork, IPoktGatewayNetworkData } from "../poktGateway";
import { UserNetwork } from "../networks";


/**
 * User Optimism Network Class
 */
 export interface UserNetworkOptimism extends UserNetwork<OptimismNetworkData> {
   
}

/**
 * Optimism Network
 * This will hold all metadata pertinent to Optimism
 * Currently implements {@link IGatewayNetwork}
 */
 export class OptimismNetworkData implements IGatewayNetwork {
  gatewayNetworkData: IPoktGatewayNetworkData;
  constructor( poktGatewayNetworkData: IPoktGatewayNetworkData) {
      this.gatewayNetworkData = poktGatewayNetworkData;  
    }
}