import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data'
import path from 'path';
import https from 'https'
import 'dotenv/config'
import logger from '../services/bscLogger'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);

const paymentPutURL = process.env.PAYMENT_PUT_URL;

export const paymentMethod = {
    create: async(req, res) => {
        logger.debug('started putPaymentInformation', {module: this.module, context: req.body.data});
        //network?
        let creditInformation = Object.keys(req.body.data.order.creditInformation).map((option) => Buffer.from )
        let clientId = 5;
        let type = CreditCard
        let data = new FormData;
        data.append('identifier',process.env.WHMCS_IDENTIFIER);
        data.append('secret',process.env.WHMCS_SECRET);
        data.append('action','AddPayMethod');
        data.append('responseType','json');
        data.append('type', type)
        data.append('clientid',clientId);
        data.append('card_number', '0000000000000000');
        data.append('card_expiry', '0224');
        data.append('set_as_default', true);
        data.append('description', 'My Fake CC')
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
 
    },
    read: async( req, res) => {
        logger.debug('started putPaymentInformation', {module: this.module, context: req.body.data});
        //network?
        let creditInformation = Object.keys(req.body.data.order.creditInformation).map((option) => Buffer.from )
        let clientId = 5;
        let data = new FormData;
        data.append('identifier',process.env.WHMCS_IDENTIFIER);
        data.append('secret',process.env.WHMCS_SECRET);
        data.append('Content-Type','multipart/form-data');
        data.append('action','GetPayMethods');
        data.append('responsetype', 'json')
        data.append('clientid', clientId);
        
        const requestOptions = {
            baseURL: process.env.WHMCS_BASE_URL,
            url: '/includes/api.php',
            method: "get",
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: data.getHeaders(),
            data: data,
        };
        await axios
        .request(requestOptions)
        .then(async (response) => {
            logger.debug("read()", { module: thisModule }, { response: response.data });
            res.send(response.data)
        })
        .catch((err) => {
            logger.error("read()", { module: thisModule }, { error: err.response?.data ? err.response.data : err.message });
            throw err;
        });
    },
    delete: async( req, res) => {
        logger.debug('started putPaymentInformation', {module: this.module, context: req.body.data});
        //network?
        let creditInformation = Object.keys(req.body.data.order.creditInformation).map((option) => Buffer.from )
        let clientId = 5;
        let payMethodId = 2
        let data = new FormData;
        data.append('identifier',process.env.WHMCS_IDENTIFIER);
        data.append('secret',process.env.WHMCS_SECRET);
        data.append('Content-Type','multipart/form-data');
        data.append('action','DeletePayMethod');
        data.append('responsetype', 'json')
        data.append('clientid', clientId);
        data.append('paymethodid', payMethodId);
        
        const requestOptions = {
            baseURL: process.env.WHMCS_BASE_URL,
            url: '/includes/api.php',
            method: "delete",
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: data.getHeaders(),
            data: data,
        };
        await axios
        .request(requestOptions)
        .then(async (response) => {
            logger.debug("delete()", { module: thisModule }, { response: response.data });
            res.send(response.data)
        })
        .catch((err) => {
            logger.error("delete()", { module: thisModule }, { error: err.response?.data ? err.response.data : err.message });
            throw err;
        });
    }
}
