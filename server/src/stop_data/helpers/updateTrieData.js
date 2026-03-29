// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape

// creates a list of unique names
// the client will then create the trie

import * as fs from "node:fs/promises";
import { StopSummary } from "../classes.js";

export async function updateTrieData() {
	const stopGroups = JSON.parse(await fs.readFile("./data/stopDetails.json"));

	const trieData = [];

	for (let i = 0; i < stopGroups.length; i++) {
		const { name, id } = stopGroups[i];
		trieData[i] = new StopSummary(name, id);
	}

	await fs.writeFile(`./data/trieData.json`, JSON.stringify(trieData));

	return trieData;
}
