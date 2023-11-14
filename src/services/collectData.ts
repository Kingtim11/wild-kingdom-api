import getCollectionFromDB, { connectToMongoDB } from "../services/getCollectionFromDB";
import { dbCollections, dbNames } from '../types/dbTypes';
import fetchData from "./fetchData";
import asyncFilter from "./asyncFilter";

export default async function collectData() {
    const db_connection = await connectToMongoDB();

    const collection = await getCollectionFromDB(
        db_connection,
        dbNames.TEST,
        dbCollections.SOURCE
    );
    
    try {
         //Search DB for any existing targets and create an array for them
        const existing_targets = (
            await collection
                .aggregate([
                    {
                        $match: {
                            '@id': { $exists: true }
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            url: '$@id'
                        }
                    }
                ]).toArray()
        ).map((item) => item.url);
        
        const newTargets = await fetchData();

        const filtered_targets = await asyncFilter(
            newTargets,
            async (newTargets: any) => {
                if (existing_targets.includes(newTargets['@id']))
                return false;
                return true;
            }
        )

        //console.log('Existing Targets:', existing_targets);
        //console.log('New Targets:', newTargets);
        //console.log('Filtered Targets:', filtered_targets)

        if (filtered_targets.length > 0 ) {
            const insertToDB = await collection.insertMany(filtered_targets);
            console.log("Data inserted:", insertToDB.insertedCount);
        } else {
            console.log("No new data to be pushed to api_source database")
        }
        
    } catch(error) {
        console.error('Error fetching data:', error);
    }
};