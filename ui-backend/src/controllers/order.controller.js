import 'dotenv/config';
import logger from '../services/bscLogger.js';
import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);

const orderPutURL = process.env.ORDER_PUT_URL;

const orderController = {
    create: async(req, res) => {
        logger.debug('started putOrderInformation', {module: thisModule, context: req.body.data});
        //let quantity=req.body.data.order.qty;
        let network=req.body.data.order.selectedNetwork.pid;

        // This will need to be modified to handle quantities > 1.
        let configOptions = Object.keys(req.body.data.order.configOptions).map((optionType) => Buffer.from(`a:1:{i:${req.body.data.order.configOptions[optionType].optionTypeId};i:${req.body.data.order.configOptions[optionType].id}}`).toString('base64'));
        let clientId=5; /* for testing - this is the test Client in WHMCSDEV */
        let data = new FormData();
        data.append('identifier',process.env.WHMCS_IDENTIFIER);
        data.append('secret',process.env.WHMCS_SECRET);
        data.append('action','AddOrder');
        data.append('responseType','json');
        data.append('clientid',clientId);
        data.append('paymentmethod','offlinecc');
        data.append('pid',req.body.data.order.selectedNetwork.pid);
        data.append('billingcycle','monthly');
        configOptions.map((configOption) => data.append('configoptions',configOption));
    
        const requestOptions = {
            baseURL: process.env.WHMCS_BASE_URL,
            url: '/includes/api.php',
            method: "post",
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: data.getHeaders(),
            data: data,
        };
        await axios
        .request(requestOptions)
        .then(async (response) => {
            logger.debug("create()", { module: thisModule }, { response: response.data });
            res.send(response.data)
        })
        .catch((err) => {
            logger.error("create()", { module: thisModule }, { error: err.response?.data ? err.response.data : err.message });
            throw err;
        });
        
    }
}

export default orderController;