require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGO_OPTIONS = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
};

const DATABASE_NAME = 'NousIndex';

const createMongoClient = () =>
  new MongoClient(process.env.MONGODB_URI, MONGO_OPTIONS);

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    const client = createMongoClient();
    dbPromise = client
      .connect()
      .then((c) => c.db(DATABASE_NAME))
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }
  return dbPromise;
}

module.exports = { createMongoClient, getDb, DATABASE_NAME, MONGO_OPTIONS };
