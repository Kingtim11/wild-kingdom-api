import { MongoClient, Db } from "mongodb";
import { dbNames } from "../types/dbTypes";

export default async (client: MongoClient, dbName: dbNames): Promise<Db> => {
  const DB_NAME = dbName;
  return client.db(DB_NAME);
};