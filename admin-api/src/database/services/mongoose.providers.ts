import { createConnection } from 'mongoose';

export const firstDbConnection = createConnection('mongodb+srv://bsc_core_stg:9g7uhNv8CzWc4jZJ@corestaging.s1idp.mongodb.net/?retryWrites=true&w=majority', {});

export const secondDbConnection = createConnection('mongodb://blockspaces:blockspaces@localhost:27017/connect?replicaSet=rs0&readPreference=primary&tls=false', {});
