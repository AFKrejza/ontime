import fs from "fs/promises";
import { removeDiacritics } from "../../utils/removeDiacritics.js";
import { Line } from "../classes.js";
import { DetailedStop } from "../classes.js";

// only outputs stops in Prague
export async function updateStopDetails() {
	const raw = JSON.parse(await fs.readFile(`./data/stops.json`));
	const stopGroups = getPragueStops(raw.stopGroups);

	const stopDetails = [];

	const asciiNames = new Set();

	for (let i = 0; i < stopGroups.length; i++) {
		let name = stopGroups[i].uniqueName;
		const slug = toSlug(name);
		const asciiName = removeDiacritics(stopGroups[i].uniqueName);

		if (asciiNames.has(asciiName))
			name = name.concat('_2'); // there's only one duplicate in the whole list.
		asciiNames.add(asciiName);
		
		const stop = new DetailedStop(
			slug,
			name,
			asciiName,
			getLines(stopGroups[i])
		);
		stopDetails.push(stop);
	}
	await fs.writeFile(`./data/stopDetails.json`, JSON.stringify(stopDetails));
	return true;
}

// gets all lines from a stopGroup
function getLines(stopGroup) {
	
	const stopData = {};
	const stops = stopGroup.stops;

	for (let i = 0; i < stops.length; i++) {
		const gtfsId = stops[i].gtfsIds[0]; // TODO: check the behavior when there are multiple gtfsIds. Test every single stop.
		const lines = stops[i].lines;
		for (let j = 0; j < lines.length; j++) {
			const line = new Line(
				lines[j].id,
				gtfsId,
				lines[j].name,
				removeDiacritics(lines[j].direction),
				lines[j].type,
				lines[j].direction
			);

			if (!stopData[line.type])
				stopData[line.type] = [];
			stopData[line.type].splice(computeIndex(stopData[line.type], line), 0, line); // sorts by name (line number)
		}
	}

	for (const type in stopData)
		if (!type[0])
			delete stopData.type;

	return stopData;
}

export function computeIndex(lines, line) {
	let i = 0;
	for (; i < lines.length; i++) {
		if (removeDiacritics(line.name) < removeDiacritics(lines[i].name))
			return i;
	}
	return i;
}

function getPragueStops(stops) {
	const pragueStops = [];
	for (const i in stops) {
		if (stops[i].municipality === 'Praha')
			pragueStops.push(stops[i]);
	}
	return pragueStops;
}

function toSlug(name) {
	return removeDiacritics(name.toLowerCase().replace(/\s+/g, '-'));
}
