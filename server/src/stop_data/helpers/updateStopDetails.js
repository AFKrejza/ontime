import fs from "fs/promises";
import { removeDiacritics } from "../../utils/removeDiacritics.js";
import { Line } from "../classes.js";
import { DetailedStop } from "../classes.js";

// only takes stops in Prague

export async function updateStopDetails() {
	const raw = JSON.parse(await fs.readFile(`./data/stops.json`));
	const stopGroups = getPragueStops(raw.stopGroups);

	const stopDetails = [];

	const latinNames = new Set();

	for (let i = 0; i < stopGroups.length; i++) {
		let name = stopGroups[i].uniqueName;

		let latin = removeDiacritics(stopGroups[i].uniqueName);
		if (latinNames.has(latin))
			name = name.concat('_2'); // TODO: issue: it adds _2 to both the name and id. Only the id should have the _2 appended. Look for piskova, there should be 2 IDS: piskova, piskova_2
		latinNames.add(latin);

		let id = removeDiacritics(name.toLowerCase());
		
		const stop = new DetailedStop(
			name,
			id,
			getStops(stopGroups[i])
		);

		stopDetails.push(stop);
	}

	await fs.writeFile(`./data/stopDetails.json`, JSON.stringify(stopDetails));

	return true;
}

// gets all unique lines from a stopGroup, making several lines if a line has more than one direction
function getStops(stopGroup) {
	
	const stopData = {};
	const stops = stopGroup.stops;

	for (let i = 0; i < stops.length; i++) {
		const gtfsId = stops[i].gtfsIds[0]; // TODO: check the behavior when there are multiple gtfsIds. Test every single stop.
		const lines = stops[i].lines;
		for (let j = 0; j < lines.length; j++) {
			const line = new Line(
				lines[j].id,
				lines[j].name,
				lines[j].type,
				lines[j].direction,
				gtfsId
			);

			if (!stopData[line.type])
				stopData[line.type] = [];
			stopData[line.type].splice(computeIndex(stopData[line.type], line), 0, line); // sorts by name (line number)

			let multDirs = 2;
			while (lines[j][`direction${multDirs}`]) { // creates a different line for each direction
				const line = new Line(
					lines[j].id,
					lines[j].name,
					lines[j].type,
					lines[j][`direction${multDirs}`],
					gtfsId
				);
				stopData[line.type].splice(computeIndex(stopData[line.type], line), 0, line);
				multDirs++;
			}
		}
	}

	for (const type in stopData)
		if (!type[0])
			delete stopData.type;

	return stopData;
}

function computeIndex(lines, line) {
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