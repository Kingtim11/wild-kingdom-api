import axios from "axios";
import dataTypes from "../types/dataTypes";

const baseURI = "http://environment.data.gov.uk/water-quality";

// Get data
export default async function fetchData() {
    try {
        const response = await axios.get(`${baseURI}/data/sample?area=6-27&_limit=5&year=2020&year=2021&year=2023`, { responseType: "json" });
        const data: dataTypes[] = response.data.items;
        const sampleIdArray = data.map((item: { ['@id']: string }) => item['@id']); //Array of sample target URLs
        
        //Map is used to tranform each element(sample URLs) in sampleIdArray into a promise which is returned by axios.get.
        //Each promise will return an object with all the sample data.
        const dataArray: dataTypes[] = await Promise.all(sampleIdArray.map(async (element) => {
            const response2 = await axios.get(element, { responseType: "json" });
            return response2.data.items;
            
        }))
        const flatDataArray = dataArray.flatMap(object => object);
        return flatDataArray;
        
    } catch (error) {
        console.error(`Error: ${error}`);
        throw new Error(`Error fetching sampling point data.`);
    }
}
fetchData();