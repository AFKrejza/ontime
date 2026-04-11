import { fetchStops } from "./helpers/fetchStops.js";
import { updateStopDetails } from "./helpers/updateStopDetails.js";
import { packStopsLines } from "../dao/pidDao.js";
import { pgClient } from "../db/postgres.js";

export async function updateData() {
	try {
		console.log("Checking PID data...");
		const fetchResult = await fetchStops();

		if (fetchResult === 2) { // if stops.json is already up to date
			const result = await pgClient.query(`SELECT COUNT(*) FROM stops`);
			if (parseInt(result.rows[0].count) > 0) {
				console.log(`PID data up to date, skipping`);
				return;
			}
			console.log(`stops.json is recent but DB is empty, inserting...`);
		} else {
			console.log(`Fresh stops.json, updating DB...`);
		}
		await updateStopDetails();
		await packStopsLines();
		console.log("All data updated successfully");
	} catch (err) {
		console.error(`updateData failed: ${err}`);
	}
}