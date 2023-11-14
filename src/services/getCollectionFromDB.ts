import { MongoClient, Collection } from "mongodb";
import "dotenv/config";
import { dbCollections, dbNames } from "../types/dbTypes";
//import logger from "../services/logger";

let connection: any = null;

export const connectToMongoDB = async () => {
  if (connection) {
    try {
      await connection.db().admin().ping();
      //logger.silly("Using existing connection");
      return connection;
    } catch (error) {
      console.error("Error pinging existing connection:", error);
      connection = null;
    }
  }
  //logger.info("Establishing new connection");
  connection = await MongoClient.connect(process.env.MONGO_URI || "")
  return connection;

}

export default async (
  client: MongoClient,
  dbName: dbNames,
  collection: dbCollections
): Promise <Collection> => {
  const DB_NAME = dbName
  const db = client.db(DB_NAME);
  return db.collection(collection)
};