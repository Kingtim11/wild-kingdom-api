import getCollectionFromDB, { connectToMongoDB } from "./getCollectionFromDB";
import { dbCollections, dbNames } from '../types/dbTypes';

export async function transformData() {
    const db_connection = await connectToMongoDB();

    const extract_db = await getCollectionFromDB(
        db_connection,
        dbNames.TEST,
        dbCollections.SOURCE
    );

    const transform_db = await getCollectionFromDB(
        db_connection,
        dbNames.TEST,
        dbCollections.DESTINATION
    );
    
    try {
        const samplingPoints = (
            await transform_db.aggregate([
                {
                    $match : {
                        '@id': { $exists: true }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        '@id': 1,
                        'measurements': 1
                    }
                }
            ]).toArray()
        )

        const measurementData = (
            await extract_db.aggregate([
                {
                    $match : {
                        '@id': { $exists: true }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        //'@id': 1,
                        'measurement': 1,
                        'sampleDateTime': 1
                    }
                }
            ]).toArray()
        )
        
        console.log('Determinand data:', measurementData)
        console.log('Sampling Point:', samplingPoints);



    } catch(error) {
        console.error('Error in trasnforData:', error)
    }
}