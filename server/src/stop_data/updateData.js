import { fetchStops } from "./helpers/fetchStops.js";
import { updateStopDetails } from "./helpers/updateStopDetails.js";
import { updateTrieData } from "./helpers/updateTrieData.js";
import { createStopsLinesDB } from "../../db.js";

// TODO: schedule a daily update, retry if it fails, verify on startup

// TODO: check fetchStops notes. Also, it needs to restart depending on specific errors
export async function updateData() {
	try {
		console.log("Updating data...");
		await fetchStops();
		await updateStopDetails();
		await updateTrieData();
		// update/create stops and lines table based on Details.json
		await createStopsLinesDB();
		console.log("All data updated successfully");
	} catch (err) {
		console.error(`updateData failed: ${err}`);
	}
}