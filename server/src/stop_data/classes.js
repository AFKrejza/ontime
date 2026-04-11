export class StopSummary {
	constructor(slug, name, displayAscii) {
		this.slug = slug;
		this.name = name;
		this.displayAscii = displayAscii;
	}
}

export class DetailedStop extends StopSummary {
	constructor(slug, name, displayAscii, lines) {
		super(slug, name, displayAscii);
		this.lines = lines;
	}
}

export class Line {
	constructor(pidId, gtfsId, name, displayAscii, type, direction) {
		this.pidId = pidId;
		this.gtfsId = gtfsId;
		this.name = name;
		this.displayAscii = displayAscii;
		this.type = type;
		this.direction = direction;
	}
}
