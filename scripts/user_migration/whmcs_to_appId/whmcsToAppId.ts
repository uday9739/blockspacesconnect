import securePass from 'secure-random-password'
import axios, {AxiosRequestConfig} from 'axios'
import * as console from "console"
import accounts from "./accounts.json"

let registerUser = async (user: object): Promise<any> => {
  try {
    const requestOptions: AxiosRequestConfig = {
      baseURL: "http://localhost:3000", //"https://webhook.site/d6d4c0ba-74ee-4943-b32f-fb5dc29729ce",
      url: `/api/users/register`, // ''
      method: "post",
      headers: {},
      data: user,
    };

    const res = await axios.request(requestOptions);
    if (res.status === 200) {
      return {status: "success", data: res.data};
    } else {
      return {status: "failed", data: res.data};
    }
  } catch (error: any) {
    return {status: "error", data: error};
  }
};


(async function () {
  let users: Array<any> = accounts.users;

  let results = await Promise.all(users.map(async (user: any)=>{
    const password = securePass.randomPassword({length: 8});
    let response = await registerUser({
      email: user.email,
      firstName: user.firstname,
      lastname: user.lastName,
      password: password
    });
    console.log(`${JSON.stringify(user.email)} / ${password}`);
    return response;
  }));

  results.forEach( (result: any) => {
    console.log(JSON.stringify(result));
  });

}());


