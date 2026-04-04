import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "node:fs/promises";
import { updateData } from "./src/stop_data/updateData.js";
import db from "./db.js";
import router from "./testing_db.js"; 
import { sampleDao } from "./src/dao/sampleDao.js";
import { pgClient, initDB } from "./src/db/postgres.js";
import { pidDao } from "./src/dao/pidDao.js";

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const app = express();
app.use(express.json());
app.use(cors({
	origin: CLIENT_URL
}));

async function dbCheck() {
	try {
		const result = await pgClient.query(`SELECT NOW()`);
		console.log("Database connected:", result.rows[0].now);
	} catch (err) {
		console.log("DB error, will use mock data");
		console.error(err.message);
	}
}

// Initialize database and check connection
await initDB();
await dbCheck();
await pidDao.checkDatabase();

// Seed mock data for tower and gateway
await pidDao.seedMockData();

// Routes
app.use("/api/tower", router);

// Update PID data (stops, lines, etc.)
await updateData();

// ==================== CLIENT-SERVER ENDPOINTS ====================

// 1a. Get all stops for autocomplete
// GET /api/stops?q=search_term
app.get("/api/stops", async (req, res) => {
	try {
		const searchQuery = req.query.q || "";
		let stops = await pidDao.getAllStops();
		
		// Filter by search query if provided
		if (searchQuery) {
			const lowerQuery = searchQuery.toLowerCase();
			stops = stops.filter(stop => 
				stop.name.toLowerCase().includes(lowerQuery) || 
				stop.id.toLowerCase().includes(lowerQuery)
			);
			// Limit results to 20 for autocomplete
			stops = stops.slice(0, 20);
		}
		
		res.json(stops);
	} catch (err) {
		console.error("Error fetching stops:", err);
		res.status(500).json({ error: "Failed to fetch stops" });
	}
});

// 1b. Get stop details with lines
// GET /api/stops/:id
app.get("/api/stops/:id", async (req, res) => {
	try {
		const stopId = req.params.id;
		const stopDetails = await pidDao.getStopDetails(stopId);
		res.json(stopDetails);
	} catch (err) {
		console.error("Error fetching stop details:", err);
		if (err.message.includes("not found")) {
			res.status(404).json({ error: err.message });
		} else {
			res.status(500).json({ error: "Failed to fetch stop details" });
		}
	}
});

// ==================== SERVER-GATEWAY ENDPOINTS ====================

// 2a. Get departures for a gateway (all towers)
// GET /api/gateway/:gatewayId/departures
app.get("/api/gateway/:gatewayId/departures", async (req, res) => {
	try {
		const gatewayId = req.params.gatewayId;
		
		// Get gateway configuration
		const gatewayConfig = await pidDao.getGatewayConfig(gatewayId);
		
		// Fetch departures for each tower
		const displayData = [];
		
		for (const tower of gatewayConfig.towers) {
			if (!tower.stop_gtfs_id || !tower.line_gtfs_id) {
				console.log(`Tower ${tower.tower_id} missing stop or line configuration`);
				continue;
			}
			
			try {
				// Fetch departures from PID API
				const data = await pidDao.fetchDeparturesFromPID(
					tower.stop_gtfs_id, 
					tower.line_gtfs_id,
					60,
					-10
				);
				
				// Format departures
				const departures = [];
				if (data.departures && data.departures.length > 0) {
					for (const departure of data.departures) {
						const departureTime = new Date(departure.departure_timestamp?.actual || departure.departure_timestamp?.planned);
						const now = new Date();
						const minutesLeft = Math.round((departureTime - now) / 60000);
						
						departures.push({
							lineNumber: departure.route?.short_name || tower.line_gtfs_id,
							lineDirection: departure.route?.long_name || departure.direction || "",
							stopName: tower.stop_name || "",
							nextTime: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
							leaveIn: minutesLeft <= 0 ? "now" : `${minutesLeft}m`,
							type: this.getLineType(tower.line_gtfs_id)
						});
					}
				}
				
				if (departures.length > 0) {
					displayData.push({
						towerId: tower.tower_id,
						departures: departures
					});
				}
			} catch (err) {
				console.error(`Failed to fetch departures for tower ${tower.tower_id}:`, err.message);
				// Add mock departure data for testing
				displayData.push({
					towerId: tower.tower_id,
					departures: [
						{
							lineNumber: tower.line_gtfs_id,
							lineDirection: "Direction",
							stopName: tower.stop_name || "Stop",
							nextTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
							leaveIn: "5m",
							type: 0
						}
					]
				});
			}
		}
		
		res.json({
			timestamp: new Date().toISOString(),
			displayData
		});
	} catch (err) {
		console.error("Error fetching gateway departures:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// 2b. Get departures for a single tower
// GET /api/tower/:towerId/departures
app.get("/api/tower/:towerId/departures", async (req, res) => {
	try {
		const towerId = req.params.towerId;
		
		// Get tower configuration
		const towerConfig = await pidDao.getTowerConfig(towerId);
		
		if (!towerConfig.stop_gtfs_id || !towerConfig.line_gtfs_id) {
			return res.status(400).json({ 
				error: "Tower not configured with stop and line",
				tower: towerConfig
			});
		}
		
		// Fetch departures from PID API
		const data = await pidDao.fetchDeparturesFromPID(
			towerConfig.stop_gtfs_id,
			towerConfig.line_gtfs_id,
			60,
			-10
		);
		
		// Format the response
		const departures = [];
		if (data.departures && data.departures.length > 0) {
			for (const departure of data.departures) {
				const departureTime = new Date(departure.departure_timestamp?.actual || departure.departure_timestamp?.planned);
				const now = new Date();
				const minutesLeft = Math.round((departureTime - now) / 60000);
				
				departures.push({
					lineNumber: departure.route?.short_name || towerConfig.line_gtfs_id,
					lineDirection: departure.route?.long_name || departure.direction || "",
					stopName: departure.stop?.name || "",
					nextTime: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					leaveIn: minutesLeft <= 0 ? "now" : `${minutesLeft}m`,
					vehicleType: departure.route?.type,
					departureTime: departureTime.toISOString()
				});
			}
		}
		
		res.json({
			towerId: towerId,
			stopId: towerConfig.stop_id,
			stopGtfsId: towerConfig.stop_gtfs_id,
			lineName: towerConfig.line_gtfs_id,
			timestamp: new Date().toISOString(),
			departures
		});
	} catch (err) {
		console.error("Error fetching tower departures:", err);
		res.status(500).json({ error: err.message });
	}
});

// Helper function to determine line type
function getLineType(lineNumber) {
	// Simple heuristic: buses are numbers, trams have numbers, metro is letter
	if (lineNumber.match(/^[A-Z]$/)) return 2; // Metro
	if (lineNumber.match(/^\d+$/)) {
		const num = parseInt(lineNumber);
		if (num < 100) return 1; // Tram
		return 0; // Bus
	}
	return 0;
}

// ==================== LEGACY ENDPOINTS (keep for compatibility) ====================

app.get("/trieData", async (req, res) => {
	const data = JSON.parse(await fs.readFile("./data/trieData.json"));
	res.send(data);
});

app.get("/bustest", async (req, res) => {
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
		res.status(404).send(err.message);
	}
});

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
		if (!data.departures || data.departures.length === 0) {
			const msg = `No departures found for line ${name}`;
			console.log(msg);
			res.send(msg);
		}
		console.log(data);
		res.send(data);
	} catch (err) {
		console.error(err);
		res.status(500).send(err.message);
	}
});

app.use("/dbtest", async (req, res) => {
	try {
		const result = await pgClient.query("SELECT NOW()");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send("DB error");
	}
});

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(SERVER_PORT, () => {
	console.log(`Server listening on port ${SERVER_PORT}`);
	console.log(`API endpoints available:`);
	console.log(`  GET  /api/stops - Get all stops for autocomplete`);
	console.log(`  GET  /api/stops/:id - Get stop details with lines`);
	console.log(`  GET  /api/gateway/:gatewayId/departures - Get departures for gateway`);
	console.log(`  GET  /api/tower/:towerId/departures - Get departures for tower`);
	console.log(`  GET  /health - Health check`);
});