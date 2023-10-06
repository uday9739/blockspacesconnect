import axios, {AxiosRequestConfig} from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const BLOCKSPACES_SERVICES_URL = process.env.BLOCKSPACES_SERVICES_URL;
const BLOCKSPACES_SERVICES_PORT = process.env.BLOCKSPACES_SERVICES_PORT;

it('returns the title of the first album', async () => {

  const requestOptions:AxiosRequestConfig = {
    baseURL: `${BLOCKSPACES_SERVICES_URL}:${BLOCKSPACES_SERVICES_PORT}`,
    url: `/api/blockflow/test/sometokenhere`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data: {parameters:"here"},
  };

  let testResponse =  {
    data: [{id: 1, data: 1},{id: 2, data: 2},{id: 3, data: 3}]
  };
  mockedAxios.request.mockResolvedValue(testResponse);

  let response = await mockedAxios
    .request(requestOptions)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });

  expect(response).toEqual(testResponse);
});