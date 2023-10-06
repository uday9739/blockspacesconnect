import server from "../bin/www.js"
import supertest from "supertest";
import {logger, transactionLogger} from "../src/services/bscLogger";
import {jest} from "@jest/globals";

let request = null;

//Make the console quite for testing
logger.info = jest.fn();
logger.debug = jest.fn();
logger.error = jest.fn();
logger.trace = jest.fn();
logger.log = jest.fn();
//Make the console quite for testing
transactionLogger.info = jest.fn();
transactionLogger.debug = jest.fn();
transactionLogger.error = jest.fn();
transactionLogger.trace = jest.fn();
transactionLogger.log = jest.fn();

beforeAll((done) => {
  request = supertest.agent(server,null);
  done();
});
afterAll((done) => {
  server.close(done);
});

describe("The user route should respond to", () => {

  it("POST /api/users/login", async () => {
    await request.post("/api/users/login")
      .send({email: "ramos.jeremy@gmail.com", password: "passw0rd"})
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty("email");
        expect(response.body).toHaveProperty("clientId");
        expect(response.body).toHaveProperty("token");
        expect(response.body.token).toHaveProperty("access_token");
        expect(response.body.token).toHaveProperty("id_token");
        expect(response.body.token).toHaveProperty("refresh_token");
        expect(response.body.token).toHaveProperty("token_type");
        expect(response.body.token).toHaveProperty("expires_in");
        expect(response.body.token).toHaveProperty("scope");
      });
  });

});

/*
describe("The user route should", () => {

  it("GET /api/users/test",  ()=> {
    return request
      .get('/api/users/test')
      .expect(200)
      .expect((response) => {
        expect(response.body).toStrictEqual({message: 'ME OK!'});
      })
      .then(response => {
        console.log('DONE');
      })
      .catch(err => (console.log(err)))
  });

   it("POST /api/users/login",  ()=> {
      return request
        .post('/api/users/login')
        .send({email: "ramos.jeremy@gmail.com", password: "passw0rd"})
        .expect(200)
        .expect((response) => {
          console.log(response.body);
          expect(1).toBe(1);
        })
        .then(response => {
          console.log('DONE');
        })
        .catch(err => (console.log(err)))
    });

});
*/


