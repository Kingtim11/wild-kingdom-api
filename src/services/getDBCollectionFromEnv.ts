import { MongoClient, Collection } from "mongodb";
import "dotenv/config";
import { dbCollections } from "../types/dbTypes";

export default async (
  client: MongoClient,
  collection: dbCollections
): Promise <Collection> => {
  const DB_NAME = process.env.DB_NAME;
  const db = client.db(DB_NAME);
  return db.collection(collection)
};