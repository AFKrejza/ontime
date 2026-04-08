// Read data from data/stops.json and do some analysis

import * as fs from 'node:fs';
import { Trie } from '../src/trie.js';
import { removeDiacritics } from '../src/utils/removeDiacritics.js';

/*

THIS IS A SCRATCHPAD, DON'T EXPORT ANY OF THESE FUNCTIONS

*/

async function showNames() {
	let data = fs.readFileSync(`./server/data/stops.json`);
	data = JSON.parse(data);
	const stops = data.stopGroups;

	// console.log(`total stops: ${totalStops}`);
	
	// countDuplicates(stops, totalStops);
	// const trie = initTrie(stops, totalStops);

	// console.log("Search Vysočanská: " + trie.contains("Vysočanská"));
	
	// const vysocanska = stops.find((stop) => stop.name === "Vysočanská");
	// console.log(vysocanska);
	// for (let i = 0; i < stops.length; i++) {
		
	// 	if (stops[i].name === "Vysočanská") {
	// 		console.log(i);
	// 		return i;
	// 	}
	// }

	// Vysocanska = 7903

	// const lineList = [];
	// vysocanska.stops.forEach((stop) => {
	// 	for (let i = 0; i < stop.lines.length; i++) {
	// 		stop.lines[i].gtfsId = stop.gtfsIds[0]; // WARNING: sometimes there are multiple IDs! TODO: Ensure correct behavior.
	// 		lineList.push(stop.lines[i]);
	// 	}
	// });
	
	// now i can filter it by type
	// const trams = lineList.filter((line) => line.type === "tram");
	// printList(trams);
	// now it should just display a dropdown menu with the name and direction
	// say I select tram 12 Lehovec:
	// const tram = trams.find((tram) => tram.direction === "Lehovec" && tram.name === "12"); // TODO: I'm not sure if checking both is redundant.
	// console.log(tram);
	// console.log(tram.name, tram.direction, tram.gtfsId);

	// countDuplicateCoords(stops);
	// countDuplicateMunicipalities(stops);

	// countDuplicates(stops, "node");
	// const dupeUNames = countDuplicates(stops, "uniqueName");
	// console.log(dupeUNames);

	const pragueStops = [];
	for (const i in stops) {
		if (stops[i].municipality === 'Praha')
			pragueStops.push(stops[i]);
	}
	
	// for (const i in pragueStops) {
	// 	// if (pragueStops[i].uniqueName === 'Písková' || pragueStops[i].uniqueName === 'Píškova')
	// 	console.log(pragueStops[i]);
	// }
	// countDuplicates(pragueStops, 'uniqueName'); // ok for Praha municipality

	// latinDupes(pragueStops);

	const latinStops = [];
	for (const i in pragueStops) {
		// if (pragueStops[i].uniqueName[0] === 'V') console.log(pragueStops[i].uniqueName);
		const name = removeDiacritics(pragueStops[i].uniqueName.toLowerCase());
		latinStops.push(name);
		if (name === 'vysocanksa') console.log(name);
	}
	// console.log(latinStops.length);


	// console.log(latinStops.find((name) => name === 'adamov'));
	// const trie = initTrie(latinStops);
	// console.log(trie.contains("adamov"));
	// console.log(trie.find("piskova"));

	// await countLines();

	longestName(latinStops);
}

// check the maximum request size that needs to be transmitted
function maxSize(stops) {

}

// 37
function longestName(latinStops) {
	let longest = "";
	for (const i in latinStops) {
		const name = latinStops[i];
		if (name.length > longest.length) {
			longest = name;
			console.log(name.length);
		}
	}
}

async function countLines() {
	const stops = JSON.parse(fs.readFileSync(`./server/data/stopDetails.json`));
	let lineCount = 0;
	for (const i in stops) {
		const types = Object.getOwnPropertyNames(stops[i].lines);
		for (let j = 0; j < types.length; j++) {
			lineCount += stops[i].lines[types[j]].length;
		}
	}
	console.log(stops[0].lines[0]);
	console.log(lineCount);
}

// Písková & Píškova are duplicated in the latin alphabet!
function latinDupes(stops) {
	const names = new Set();
	for (let i in stops) {
		const latinName = removeDiacritics(stops[i].uniqueName);
		if (names.has(latinName))
			console.log(`Duplicate!: ${latinName}, ${stops[i].uniqueName}`);
		names.add(latinName);
	}
	console.log(names.length);
}

function countDuplicates(stops, property) {
	const exists = new Set();
	const duplicates = [];

	for (let i = 0; i < stops.length; i++) {
		if (exists.has(stops[i][property])) {
			console.log(`Duplicate ${property} exists!`);
			duplicates.push(stops[i][property]);
		}
		else
			exists.add(stops[i][property]);
	}

	return duplicates;
}

function printDistrictCodes(stops) {
	const districtCodes = [];
	for (const i in stops) {
		if (!districtCodes.includes(stops[i].districtCode))
			districtCodes.push(stops[i].districtCode);
	}
	
	districtCodes.sort();
	console.log(districtCodes);
}

function printMunicipalities(stops) {
	const municipalities = [];
	for (const i in stops) {
		if (!municipalities.includes(stops[i].municipality))
			municipalities.push(stops[i].municipality);
	}
	
	municipalities.sort();
	console.log(municipalities);
}

// checks if municipalities and district codes are the same thing
function muniDisCheck(stops) {
	const exists = new Map();
	for (let i = 0; i < stops.length; i++) {
		const muni = exists.get(stops[i]['districtCode']);
		if (muni && muni !== stops[i]['municipality']) {
			console.log(`${i} ${stops[i]['districtCode']} exists:${muni} !== ${stops[i]['municipality']}`);
		}
		else
			exists.set(stops[i]['districtCode'], stops[i]['municipality']);
		console.log(stops[i]['districtCode']);
	}
	return exists;
}

// check if documentation is correct: https://pid.cz/en/opendata/#h-stops
// "The unique identifier of the group is:
//	TRUE	the triplet (name, districtCode, isTrain), USE THIS
//			or the pair (idosName, isTrain),
//	FALSE	or the name uniqueName." but works for just Prague

function triplet(stops) {
	class uniqueStop {
		constructor(name, districtCode, isTrain) {
			this.name = name;
			this.districtCode = districtCode;
			this.isTrain = isTrain;
		}
	}

	const seen = [];
	for (let i = 0; i < stops.length; i++) {
		const stop = new uniqueStop(stops[i]['name'], stops[i]['districtCode'], stops[i]['isTrain']);
		if (seen.includes(JSON.stringify(stop))) {
			console.log(`Duplicate found! ${stop.name}`);
			return;
		}
		seen.push(JSON.stringify(stop));
	}
	// console.log(seen);
}

function countDuplicateCoords(stops) {
	const exists = new Set;
	const duplicates = [];
	for (let i = 0; i < stops.length; i++) {
		if (exists.has([stops[i][`avgLat`], stops[i][`avgLon`]])) {
			console.log(`Duplicate coordinates exist!`);
			duplicates.push([stops[i][`avgLat`], stops[i][`avgLon`]]);
		}
		else
			exists.add([stops[i][`avgLat`], stops[i][`avgLon`]]);
	}
	return duplicates;
}

// duped name and municipality pairs
function countDuplicateMunicipalities(stops) {
	const exists = new Set;
	const duplicates = [];
	for (let i = 0; i < stops.length; i++) {
		if (exists.has([stops[i][`name`], stops[i][`municipality`]])) {
			console.log(`Duplicate name+municipality exists!`);
			duplicates.push([stops[i][`name`], stops[i][`municipality`]]);
		}
		else
			exists.add([stops[i][`name`], stops[i][`municipality`]]);
	}
	return duplicates;
}

function initTrie(stopNames) {
	let trie = new Trie();
	for (let i = 0; i < stopNames.length; i++)
		trie.insert(stopNames[i]);
	return trie;
}

// function initTrie(stops) {
// 	let trie = new Trie();
// 	for (let i = 0; i < stops.length; i++)
// 		trie.insert(stops[i].name);
// 	return trie;
// }

function printList(list) {
	list.forEach((item) => {
		console.log(JSON.stringify(item));
	});
}

showNames();

/*
example:
https://api.golemio.cz/v2/public/departureboards?stopIds={"0": ["U474Z6P"]}&limit=5&routeShortNames=136&minutesAfter=60&minutesBefore=-10
*/

