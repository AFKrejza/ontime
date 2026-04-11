import * as fs from "node:fs/promises";

// fetches PID Open Data's stops.json

// returns 1 if updated, 2 if it's already updated.
export async function fetchStops() {
	const localPath = `./data/stops.json`;
	const url = `https://data.pid.cz/stops/json/stops.json`;
	let currentStops;

	try {
		currentStops = JSON.parse(await fs.readFile(localPath));
	} catch (err) {
		if (err.code === "ENOENT")
			console.log("stops.json not found. Creating...");
		else {
			console.error(`Error in reading stops.json: ${err}`);
			throw new Error(err);
		}
		currentStops = false;
	}
	if (currentStops && isUpToDate(currentStops.generatedAt)) {
		return 2;
	}
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Couldn't fetch stops.json: Status code ${res.status}`);
	}

	const newStops = await res.json();

	let msg;
	currentStops ? msg = 'Updated' : msg = 'Created';

	await fs.writeFile(localPath, JSON.stringify(newStops));
	const data = await JSON.parse(await fs.readFile(localPath));
	console.log(`${msg} ${localPath}. Generated at: ${data.generatedAt}`);
	return 1;
}

// checks if it's < 24 hours old
export function isUpToDate(generatedAt) {	
	if (!generatedAt)
		return false;
	const msDay = 24 * 60 * 60 * 1000;
	const date = (new Date(generatedAt));
	const dateNow = (new Date(Date.now()));
	if (dateNow - date >= msDay)
		return false;

	return true;
}
