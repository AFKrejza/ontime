import { fetchStops } from "./helpers/fetchStops.js";
import { updateStopDetails } from "./helpers/updateStopDetails.js";
import { updateTrieData } from "./helpers/updateTrieData.js";

// TODO: schedule a daily update, retry if it fails, verify on startup

// TODO: check fetchStops notes. Also, it needs to restart depending on specific errors
// updates stops.json, stopDetails.json, trieData.json in that order!!!
export async function updateData() {
	try {
		console.log("Updating data...");
		await fetchStops();
		await updateStopDetails();
		await updateTrieData();
		console.log("All data updated successfully");
	} catch (err) {
		console.error(`updateData failed: ${err}`);
	}
}