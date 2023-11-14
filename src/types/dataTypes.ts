import { ObjectId } from "mongodb";

export default interface dataTypes {
    lat: number;
    long: number;
    notation: string;
    '@id': string;
    determinand: string;
    result: number;
    unitURI: string;
    unit: string;
    measurement: any;
}

