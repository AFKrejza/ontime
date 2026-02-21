import { removeDiacritics } from "../utils/removeDiacritics.js";

export class StopSummary {
	constructor(name, id) {
		this.name = name;
		this.id = id;
	}
}

export class DetailedStop extends StopSummary {
	constructor(name, id, lines) {
		super(name, id);
		this.lines = lines;
	}
}

export class Line {
	constructor(id, name, type, direction, gtfsId) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.direction = direction;
		this.gtfsId = gtfsId;
	}
}
