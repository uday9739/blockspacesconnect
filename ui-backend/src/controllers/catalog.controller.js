import 'dotenv/config';
import axios from "axios";
import FormData from 'form-data';
import https from 'https';
import logger from "../services/bscLogger.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);


const catalogController =  {
    findAll: async (req, res) => {
      let data = new FormData();
      data.append('identifier',process.env.WHMCS_IDENTIFIER);
      data.append('secret',process.env.WHMCS_SECRET);
      data.append('action','GetProducts');
      data.append('responsetype','json');
      data.append('gid',process.env.WHMCS_SPACES_PRODUCT_GROUP_ID);
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
      logger.debug("findAll()", { module: thisModule }, { response: response.data });
      let catalogResponse = response.data?.products?.product.map((product) => {
        product.configoptions.configoption.map((configoption)=> {
          configoption.options.option.map((option) => {
            option.optionTypeId = configoption.id
            return option;
          })
          return configoption;
        })
        return product;
      });
      res.send(catalogResponse)
    })
    .catch((err) => {
      logger.error("create()", { module: thisModule }, { error: err.response?.data ? err.response.data : err.message });
      throw err;
    });
  }
}

export default catalogController;