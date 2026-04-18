export async function fetchDepartures(input) {

	// an array of assignments, each of which also has their towerId, and the index is aligned to the response from PID
	const towerAssignments = [];
	for (let i = 0; i < input.length; i++)
	{
		for (let j = 0; j < input[i].assignments.length; j++)
		{
			const assignment = input[i].assignments[j];
			assignment.towerId = input[i].towerId;
			towerAssignments.push(assignment);
		}
	}

	let stopIds = [];
	for (let i = 0; i < input.length; i++)
	{
		for (let j = 0; j < input[i].assignments.length; j++)
		{
			const stopId = input[i].assignments[j].gtfsId;
			stopIds.push(stopId);
		}
	}
	console.log(stopIds);

	const stopIdParams = stopIds.map((id, i) => `stopIds={"${i}": ["${id}"]}`).join("&");
	const minutesBefore = 0;
	const minutesAfter = 60;
	const limit = 30;
	const url = `https://api.golemio.cz/v2/public/departureboards?${stopIdParams}&limit=${limit}&minutesAfter=${minutesAfter}&minutesBefore=${minutesBefore}`;
	console.log(url);

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"X-Access-Token": process.env.API_KEY
		}
	});


	const allDepartures = await response.json();

	// filter to correct ones then map to towerAssignments, then parse into correct structure
	for (let i = 0; i < allDepartures.length; i++) {

		// assign leaveIn and nextTime
		for (let j = 0; j < allDepartures[i].length; j++) {
			const name = towerAssignments[i].line.name;
			const shortName = allDepartures[i][j].route.short_name;

			const minutes = Number(allDepartures[i][j].departure.minutes);
			const departureOffset = towerAssignments[i].departureOffset;
			const leaveIn = minutes - departureOffset * -1;

			if (leaveIn > 0 && name === shortName)
			{
				const predicted = allDepartures[i][j].departure.timestamp_predicted;
				towerAssignments[i].nextTime = predicted.substring(11, 16);
				towerAssignments[i].leaveIn = `${leaveIn}m`;
				break;
			}
		}
		// if no bus was found
		if (!towerAssignments[i].nextTime)
		{
			towerAssignments[i].nextTime = `NONE`;
			towerAssignments[i].leaveIn = `///`;
		}
	}

	// everything MUST be a string!!!
	class Assignment {
		constructor(towerId, lineNumber, lineDirection, stopName, nextTime, leaveIn, type) {
			this.towerId = towerId;
			this.lineNumber = lineNumber;
			this.lineDirection = lineDirection;
			this.stopName = stopName;
			this.nextTime = nextTime;
			this.leaveIn = leaveIn;
			this.type = type;
		}
	}

	const enumTransportTypes = {
		bus: 0,
		metro: 1,
		tram: 2,
		trolleybus: 3,
		train: 4,
		ferry: 5
	}

	// not including null byte!
	const TOWER_ID_SIZE = 12;
	const LINE_NUMBER_SIZE = 3;
	const LINE_DIRECTION_SIZE = 15;
	const NEXT_TIME_SIZE = 5;
	const LEAVE_IN_SIZE = 3;
	const STOP_NAME_SIZE = 22;

	const towersData = [];
	// then shorten everything to the max sizes & set the type & clean up
	for (let i = 0; i < towerAssignments.length; i++)
	{
		const towerId = towerAssignments[i].towerId;
		const nextTime = towerAssignments[i].nextTime;
		const leaveIn = towerAssignments[i].leaveIn;
		let lineNumber;
		let lineDirection;
		let stopName;
		const type = enumTransportTypes[towerAssignments[i].line.type.toLowerCase()];

		if (towerAssignments[i].line.name.length > LINE_NUMBER_SIZE) {
			lineNumber = towerAssignments[i].line.name.substring(0, LINE_NUMBER_SIZE);
		} else lineNumber = towerAssignments[i].line.name;

		if (towerAssignments[i].line.displayAscii.length > LINE_DIRECTION_SIZE) {
			lineDirection = towerAssignments[i].line.displayAscii.substring(0, LINE_DIRECTION_SIZE - 2);
			lineDirection = `${lineDirection}..`;
		} else lineDirection = towerAssignments[i].line.displayAscii;

		if (towerAssignments[i].stop.displayAscii.length > STOP_NAME_SIZE) {
			stopName = towerAssignments[i].stop.displayAscii.substring(0, STOP_NAME_SIZE - 2);
			stopName = `${stopName}..`;
		} else stopName = towerAssignments[i].stop.displayAscii;

		const assignment = new Assignment(
			towerId,
			lineNumber,
			lineDirection,
			stopName,
			nextTime,
			leaveIn,
			type
		);
		towersData.push(assignment);
	}

	// parse it. This is very condensed so that every tower can be on the same topic
	// final result will be an array of all assignments of towers assigned to that gateway, e.g.:
	// [{547c65321d0b|B|Zlicin|Kolbenova|17:46|5m}{1547c65321d0b|177|Chodov|Vysocanska|17:52|15m|0}]
	// If a tower has 2 assignments it must repeat the towerId like above.
	// The string will never be that long anyway, ~600 bytes.

	const msg_start_char = '[';
	const msg_end_char = ']';
	const delimiter = '|';

	const assignment_start_char = '{';
	const assignment_end_char = '}';

	let assignments = "";
	assignments = assignments.concat(msg_start_char);
	for (let i = 0; i < towersData.length; i++)
	{
		assignments = assignments.concat(assignment_start_char);
		assignments = assignments.concat(towersData[i].towerId);
		assignments = assignments.concat(delimiter, towersData[i].lineNumber);
		assignments = assignments.concat(delimiter, towersData[i].lineDirection);
		assignments = assignments.concat(delimiter, towersData[i].stopName);
		assignments = assignments.concat(delimiter, towersData[i].nextTime);
		assignments = assignments.concat(delimiter, towersData[i].leaveIn);
		assignments = assignments.concat(delimiter, towersData[i].type);
		assignments = assignments.concat(assignment_end_char);
	}
	assignments = assignments.concat(msg_end_char);

	return assignments;
}