import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { updateData } from "./src/stop_data/updateData.js";
import {pgClient, initDB, addMockData} from "./src/db/postgres.js";
import { stopsDao } from "./src/dao/stopsDao.js";
import { authRouter } from "./src/auth/auth.js";
import { gatewayRouter } from "./src/gateways/gatewayRouter.js";
import { towerRouter } from "./src/towers/towerRouter.js";
import { userRouter } from "./src/users/userRouter.js";
import { exec } from "child_process";

dotenv.config();
const SERVER_PORT = process.env.PORT;
const CLIENT_URL = process.env.LOCAL === 'true' ? process.env.LOCAL_CLIENT_URL : process.env.CLIENT_URL;
if (process.env.LOCAL === 'true') {
	console.log('using local environment');
} else {
	console.log('cloud deployment');
}


const app = express();
app.use(express.json());
app.use(cors({
	origin: CLIENT_URL
}));

function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function dbCheck() {
	while (true)
	{
		try {
			const result = await pgClient.query(`SELECT NOW()`);
			if (result.rows[0]) {
				console.log("Connected to DB");
				break;
			}
		} catch (err) {
			console.error("DB error, retrying in 5 seconds");
			await sleep(5000);
		}
		await sleep(5000);
	}
}

await dbCheck();

// cloud disabled since we aren't wiping it constantly, but useful locally
if (process.env.LOCAL == 'true') {
	await initDB();
	await updateData();
}

app.get("/trieData", async (req, res) => {
	const data = await stopsDao.getTrieData();
	res.send(data.rows);
})

// test endpoint to get one stop's data right now
app.get("/bustest", async (req, res) => {
	//https://api.golemio.cz/v2/public/departureboards?stopIds={"0": ["U474Z6P"]}&limit=1&routeShortNames=136&minutesAfter=60&minutesBefore=-10

	const url = "https://api.golemio.cz/v2/public/departureboards?" + new URLSearchParams({
		stopIds: JSON.stringify({"0": ["U474Z6P"]}),
		limit: 1,
		routeShortNames: 136,
		minutesAfter: 60,
		minutesBefore: -10,
	});

	console.log(url);

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"X-Access-Token": process.env.API_KEY
		}
	});

	const data = await response.json();
	res.send(data);
});

// TODO: integrate with db
app.get("/stopGroups/:slug", async (req, res) => {
	try {
		const slug = req.params.slug;

		const result = await stopsDao.getStopBySlug(slug);

		if (result.rows.length === 0) return null;

		const stopGroup = {	
			id: result.rows[0].id,
			slug: result.rows[0].slug,
			name: result.rows[0].name,
			displayAscii: result.rows[0].display_ascii,
			lines: {}
		};

		for (const row of result.rows) {
			const type = row.type;
			if (!stopGroup.lines[type])
				stopGroup.lines[type] = [];
			stopGroup.lines[type].push({
				id: row.line_id,
				pidId: row.pid_id,
				name:row.line_name,
				type: row.type,
				direction: row.direction,
				gtfsId: row.gtfs_id,
				displayAscii: row.line_ascii
			});
		}
		res.send(stopGroup);
	} catch (err) {
		console.error(err);
		res.send(err); // TODO: add status codes and proper errors everywhere
	}
});

// testing endpoint without saving data
// https://api.golemio.cz/v2/public/departureboards?stopIds={"0": ["U474Z6P"]}&limit=1&routeShortNames=136&minutesAfter=60&minutesBefore=-10
app.put("/getStop", async (req, res) => {
	try {
		const gtfsId = req.body.line.gtfsId;
		const name = req.body.line.name;
		const offset = req.body.offset;
		const limit = 5;
		const minutesAfter = 60; // default 60
		const url = `
			https://api.golemio.cz/v2/public/departureboards?
			stopIds={"0": ["${gtfsId}"]}&
			limit=5&
			routeShortNames=${name}&
			minutesAfter=60&
			minutesBefore=${offset}
		`;
		const get = await fetch(url, {
			method: "GET",
			headers: {
				"X-Access-Token": process.env.API_KEY
			}
		});
		const data = await get.json();
		if (!data.departures || data.departures.length === 0) {
			const msg = `No departures found for line ${name}`;
			console.log(msg);
			res.send(msg);
		}
		console.log(data);
		res.send(data);
	} catch (err) {
		console.error(err);
	}
});

// Mock endpoint for gateway departures
app.get("/gateway/:gatewayId/departures", async (req, res) => {
	try {
		const gatewayId = req.params.gatewayId;
		
		// Mock response data as per API docs
		const mockResponse = {
			timestamp: new Date().toISOString(),
			displayData: [
				{
					towerId: "tower_001",
					departures: [
						{
							lineNumber: "136",
							lineDirection: "Jizni Mesto",
							stopName: "Vysocanska",
							nextTime: "15:50",
							leaveIn: "10m",
							type: 0
						}
					]
				}
			]
		};

		// Optional: You can vary the response based on gatewayId if needed
		// For example, if gatewayId === "2", return different mock data
		if (gatewayId === "2") {
			mockResponse.displayData[0].towerId = "tower_002";
			mockResponse.displayData[0].departures[0] = {
				lineNumber: "152",
				lineDirection: "Ceskomoravska",
				stopName: "Klicov",
				nextTime: "15:45",
				leaveIn: "5m",
				type: 0
			};
		}

		res.json(mockResponse);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// check if the db is still up and connected
app.use("/dbtest", async (req, res) => {
	try {
		const result = await pgClient.query("SELECT NOW()");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send("DB error");
	}
});

// test endpoint for a tower's TWO departures with correct parsing. based off /bustest
app.get("/towertest", async (req, res) => {

	// Based off the worked example in server-pid.md

	//https://api.golemio.cz/v2/public/departureboards?stopIds={"0": ["U75Z101P"]}&stopIds={"1": ["U474Z6P"]}&limit=30&minutesAfter=60&minutesBefore=-15
	// 	the metro B Zlicin at Kolbenova
	//	gtfsId:U75Z101P
	//	departureOffset: -15
	//	the bus 177 Chodov at Vysocanska.
	//	gtfsId: U474Z6P
	//	departureOffset: -10

	// use a JOIN to add the stop and line
	const input = [
		{
			towerId: "547c65321d0b",
			assignments: [
				{
					departureOffset: -15,
					stopId: 1200, // generated in our database
					lineId: 1, // generated in our DB
					gtfsId: "U75Z101P", // from PID,
					stop: {
						id: 1200, // our db
						slug: "kolbenova",
						name: "Kolbenova",
						displayAscii: "Kolbenova"
					},
					line: {
						id: 1, // our db
						pidId: 992, // from PID 
						gtfsId: "U75Z101P",
						name: "B", 
						displayAscii: "Zlicin",
						type: "metro", 
						direction: "Zličín"
					}
				},
				{
					departureOffset: -10,
					stopId: 3, // generated in our database
					lineId: 54, // generated in our DB
					gtfsId: "U474Z6P", // from PID,
					stop: {
						id: 3, // our db
						slug: "vysocanska",
						name: "Vysočanská",
						displayAscii: "Vysocanska"
					},
					line: {
						id: 54, // our db
						pidId: 177, // from PID 
						gtfsId: "U474Z6P",
						name: "177", 
						displayAscii: "Chodov",
						type: "bus", 
						direction: "Chodov"
					}
				}
			]
		}
	];

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
	const minutesBefore = -15; // take lowest departureOffset
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

	res.setHeader('Content-Type', 'text/plain');
	res.send(assignments);
});

app.use("/auth", authRouter);
app.use("/gateways", gatewayRouter);
app.use("/towers", towerRouter);
app.use("/users", userRouter);

app.get("/alive", (req, res) => {
	res.status(200).json({ ok: true });
});

app.listen(SERVER_PORT, () => {
	console.log(`Server listening on port ${SERVER_PORT}`);
});