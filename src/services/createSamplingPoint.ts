//Extract data from MongoDB, only new data. Filter for this.

//Group sampling point data together but only keep the most recent sample of particlular determinands.

//Insert transformed data back into a separate MongoDB collection.

/*New colection schema:
            _id
            Sampling Point id(notation)
            measurements:
                determinand
                date of determinand sample
            lat
            long
            date of last update
        */

import getCollectionFromDB, { connectToMongoDB } from "./getCollectionFromDB";
import { dbCollections, dbNames } from '../types/dbTypes';
import asyncFilter from "./asyncFilter";

export async function createSamplingPoint() {
    const db_connection = await connectToMongoDB();

    const source = await getCollectionFromDB(
        db_connection,
        dbNames.TEST,
        dbCollections.SOURCE
    );
    const destination = await getCollectionFromDB(
        db_connection,
        dbNames.TEST,
        dbCollections.DESTINATION
    );

    try {
        const new_data = (
            await source.aggregate([
                {
                    $match: {
                        '@id': { $exists: true },
                        //sampleDataTime: {$gte: '2018-01-01T00:00:00Z'}
                    },
                },
                {
                    $project: {
                        _id: 0,
                        //'@id': 1,
                        'measurement': 1,
                        'samplingPoint.lat': 1,
                        'samplingPoint.long': 1,
                        'samplingPoint.notation': 1,
                        'sampleDateTime': 1
                    }
                }
            ]).toArray()
        )

        const old_data = (
            await destination.aggregate([
                {
                    $match: {
                        '@id': { $exists: true }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        '@id': 1
                    }
                }
            ]).toArray()
        )

        //merge or create new object from samplingPointId
        const sourceData  = Object.values(
            new_data.reduce((acc, item) => {
              const notation = item['samplingPoint']['notation'];
              if (!acc[notation]) {
                acc[notation] = {
                  notation: notation,
                  lat: item['samplingPoint']['lat'],
                  long: item['samplingPoint']['long']
                };
              }
              return acc;
            }, {})
          );
          
        const destinationData: string[] = old_data.map((item) => item['@id']);
        
        //Filter tested and working
        const new_sampling_points: any[] = await asyncFilter(
            sourceData,
            async (sourceData: any) => {
                if (destinationData.includes(sourceData.notation)) 
                return false;
                return true;
            }
        )
        console.log('Source DB:', sourceData);
        console.log('Destination DB:', destinationData);
        console.log('Filter:', new_sampling_points);

        if (new_sampling_points.length > 0) {
            const insertToDB = await destination.insertMany(new_sampling_points.map(item => ({
                '@id': item.notation,
                measurements: [{ 
                    Enterococci: { Value: {}, Date: {} }, 
                    Escherichia_coli: { Value: {}, Date: {} },
                    Coliform_bacteria: { Value: {}, Date: {} },
                    Acrylamide: { Value: {}, Date: {} },
                    Antimony: { Value: {}, Date: {} },
                    Arsenic: { Value: {}, Date: {} },
                    Benzene: { Value: {}, Date: {} },
                    BenzoApyrene: { Value: {}, Date: {} },
                    Boron: { Value: {}, Date: {} },
                    Bromate:{ Value: {}, Date: {} },
                    Cadmium:{ Value: {}, Date: {} },
                    Chromium:{ Value: {}, Date: {} },
                    Copper:{ Value: {}, Date: {} },
                    Cyanide:{ Value: {}, Date: {} },
                    dichloroethane:{ Value: {}, Date: {} },
                    Epichlorohydrin:{ Value: {}, Date: {} },
                    Fluoride:{ Value: {}, Date: {} },
                    Lead:{ Value: {}, Date: {} },
                    Mercury:{ Value: {}, Date: {} },
                    Nickel:{ Value: {}, Date: {} },
                    Nitrate:{ Value: {}, Date: {} },
                    Nitrite:{ Value: {}, Date: {} },
                    Pesticides:{ Value: {}, Date: {} },
                    Polycyclic_aromatic_hydrocarbon:{ Value: {}, Date: {} },
                    Selenium:{ Value: {}, Date: {} },
                    Tetrachloroethene_and_Trichloroethene:{ Value: {}, Date: {} },
                    Trihalomethanes:{ Value: {}, Date: {} },
                    Vinyl_chloride:{ Value: {}, Date: {} },
                    Aluminium:{ Value: {}, Date: {} },
                    Colour:{ Value: {}, Date: {} },
                    Iron:{ Value: {}, Date: {} },
                    Manganese:{ Value: {}, Date: {} },
                    Sodium:{ Value: {}, Date: {} },
                    Tetrachloromethane:{ Value: {}, Date: {} },
                    Turbidity:{ Value: {}, Date: {} },
                    Ammonia: { Value: {}, Date: {} }
            }],
                Latitude: item.lat,
                Longitude: item.long,
                Created: new Date()
            })));
            console.log("Data inserted:", insertToDB.insertedCount);
        } else {
            console.log("No new data to be pushed to transformed_data database")
        }
        
    } catch(error) {
        console.error('Error fetching data for transform:', error)
    }
}