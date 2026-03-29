import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "node:fs/promises";
import { updateData } from "./src/stop_data/updateData.js";
import { scheduler, createJob } from './src/jobs/scheduler.js';
import db from "./db.js";
// 
import router from "./testing_db.js"; 
dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const app = express();
app.use(express.json());
app.use(cors({
	origin: CLIENT_URL
}));
//
app.use("/api/tower", router);
// TODO: check its todo since the behavior is not standardized. Handle returns and errors as well.
await updateData();
scheduler();

app.get("/trieData", async (req, res) => {
	const data = JSON.parse(await fs.readFile("./data/trieData.json"));
	res.send(data);
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

app.get("/stopGroups/:id", async (req, res) => {
	try {
		const id = req.params.id;

		const stopGroups = JSON.parse(await fs.readFile("./data/stopDetails.json"));
		const stop = stopGroups.find((stop) => stop.id === id);

		if (!stop)
			throw new Error(`Stop ${id} not found`);

		res.send(stop);
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
		console.log(data);
		res.send(data);
	} catch (err) {
		console.error(err);
	}
});

// TODO: needs type validation and a check to verify that the stop actually exists
// replaces the currently tracked stop.
app.put("/addStop", async (req, res) => {
	try {
		// const example = { // send all of this. Later on we'll only need the offset, stopId, lineId/name and gtfsId
		// 	offset: 10,
		// 	stopName: "Vysočanská",
		// 	stopId: "vysocanska",
		// 	line: {
		// 		id: 136,
		// 		name: "136",
		// 		type: "bus",
		// 		direction: "Jižní Město",
		// 		gtfsId: "U474Z6P"
		// 	}
		// };
		
		class Stop {
			constructor(offset, stopName, stopId, line) {
				this.offset = offset;
				this.stopName = stopName;
				this.stopId = stopId;
				this.line = line;
			}
		}
		const newStop = new Stop(req.body.offset, req.body.stopName, req.body.stopId, req.body.line);

		const msg = await createJob(newStop);
		res.send(msg);
	} catch (err) {
		console.error(err);
	}
})


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

app.listen(SERVER_PORT, () => {
	console.log(`Server listening on port ${SERVER_PORT}`);
});