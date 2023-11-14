import collectData from "./services/collectData";
import { createSamplingPoint } from "./services/createSamplingPoint";
import { transformData } from "./services/transformData";

export async function runFile() {
    try {
        //await collectData();
        //await createSamplingPoint();
        await transformData();
    } catch(error) {
        console.error(error);
    }
}
runFile();
