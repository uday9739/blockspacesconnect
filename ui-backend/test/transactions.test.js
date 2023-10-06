import server from "../bin/www.js"
import supertest from "supertest";
import db from "../src/models/index.js";
import {logger,transactionLogger,Logger} from "../src/services/bscLogger";
import {jest, expect} from "@jest/globals";


//TODO the jwt has the client id in it so that we can authorize
//Need to implement backend API interface with authentication as an organization.
//Authorize access with a client id
//BSC-142-... API

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



db.mongoose
  .connect(process.env.MONGO_CONNECT_STRING)
  .then(() => {
  })
  .catch((err) => {
    process.exit();
  });

let request = null;
let access_token ="";
let id_token = "";

const env = process.env;

beforeAll((done) => {
  request = supertest.agent(server,null);
  process.env.LOG_LEVEL = "debug";
  done();
},10000);
afterAll((done) => {
  process.env = env;
  server.close(done);
});

describe("The user route should respond to", () => {

  it("test should run", async () => {
      expect(200).toBe(200);
  });

  it("GET /api/transactions/", async () => {
    await request.get("/api/transactions/")
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty("transactions");
      });
  });


  it("get user credentials for testing", async () => {
    await request.post("/api/users/login")
      .send({email: "ramos.jeremy@gmail.com", password: "passw0rd"})
      .expect(200)
      .expect((response) => {
        access_token = response.body.token['access_token'];
        id_token = response.body.token['id_token'];
      })
  });

  it("POST /api/transactions/", async () => {
    let transaction = {
      transactionId:"999",
      startedOn:Date.now(),
      status:"started",
      description:"a test transaction",
      transactionType:"triggered flow"};

    await request.post("/api/transactions/")
      .send(transaction)
      .set({ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token})
      .expect(200)
      .expect((response) => {
        expect(JSON.stringify(response.body)).toBe(JSON.stringify({data: 'transaction was written'}));
      })

    transaction.status = "running";
    await request.put(`/api/transactions/${transaction.transactionId}/${transaction.status}`)
      .set({ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token})
      .expect(200)

    await request.get(`/api/transactions/${transaction.transactionId}`)
      .set({ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token})
      .expect(200)
      .expect((response)=>{
        expect(response.body.status).toBe(transaction.status);
      })

    transaction.status = "completed";
    await request.put(`/api/transactions/${transaction.transactionId}/${transaction.status}/${Date.now()}`)
      .set({ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token})
      .expect(200);

    await request.get(`/api/transactions/${transaction.transactionId}`)
      .set({ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token})
      .expect(200)
      .expect((response)=>{
        expect(response.body.transactionId).toBe(transaction.transactionId)
        //TODO make stored value of startedOn match returned value
        //expect(response.body.startedOn).toBe(transaction.startedOn);
        expect(response.body.status).toBe(transaction.status);
        expect(response.body.description).toBe(transaction.description);
        expect(response.body.transactionType).toBe(transaction.transactionType);
      }).then(() => {
        db.Transactions.findOne({transactionId: "999"}).remove().exec();
      });

  });

  it("write/delete a transaction direct to the database", done => {
    let transaction = new db.Transactions({
      transactionId:"24141",
      startedOn:Date.now(),
      status:"started",
      description:"a test transaction",
      transactionType:"triggered flow"});

    transaction.save().then( function (doc, err){
      expect(doc.transactionId).toBe(transaction.transactionId);
      expect(err).not.toBeTruthy();
      db.Transactions.findOne({transactionId:"24141"}).remove().exec().then( function (doc, err){
        expect(err).not.toBeTruthy();
        done();
      });
    });

  });

});



