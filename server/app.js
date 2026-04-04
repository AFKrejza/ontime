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

async function startServer() {
	try {
		await initDB();
		
		// Test database connection
		const result = await pgClient.query(`SELECT NOW()`);
		console.log("Database connected:", result.rows[0].now);
		
		// Start server first
		app.listen(SERVER_PORT, () => {
			console.log(`Server listening on port ${SERVER_PORT}`);
			console.log(`API endpoints:`);
			console.log(`  GET /api/stops - Get all stops for autocomplete`);
			console.log(`  GET /api/stops/:slug - Get stop details with lines`);
			console.log(`  GET /api/tower/:towerId/departures - Get departures for tower`);
			console.log(`  GET /api/gateway/:gatewayId/departures - Get departures for gateway`);
			console.log(`  GET /health - Health check`);
		});
		
		// Run data update in background (don't block server start)
		updateData().catch(err => console.error("Data update failed:", err));
		
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
}

// Routes
app.use("/api/tower", router);

// ==================== CLIENT-SERVER ENDPOINTS ====================

app.get("/api/stops", async (req, res) => {
	try {
		const searchQuery = req.query.q || "";
		let stops = await pidDao.getAllStops();
		
		if (searchQuery) {
			const lowerQuery = searchQuery.toLowerCase();
			stops = stops.filter(stop => 
				stop.name.toLowerCase().includes(lowerQuery) || 
				stop.slug.toLowerCase().includes(lowerQuery)
			);
		}
		
		res.json(stops);
	} catch (err) {
		console.error("Error fetching stops:", err);
		res.status(500).json({ error: "Failed to fetch stops" });
	}
});

app.get("/api/stops/:slug", async (req, res) => {
	try {
		const slug = req.params.slug;
		const stopDetails = await pidDao.getStopDetails(slug);
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

app.get("/api/tower/:towerId/departures", async (req, res) => {
	try {
		const towerId = req.params.towerId;
		const towerConfig = await pidDao.getTowerConfig(towerId);
		
		const data = await pidDao.fetchDeparturesFromPID(
			towerConfig.stop_gtfs_id,
			towerConfig.line_name
		);
		
		const departures = (data.departures || []).map(d => {
			const depTime = new Date(d.departure_timestamp?.actual || d.departure_timestamp?.planned);
			const minsLeft = Math.round((depTime - new Date()) / 60000);
			return {
				lineNumber: d.route?.short_name || towerConfig.line_name,
				lineDirection: d.route?.long_name || d.direction || "",
				stopName: d.stop?.name || "",
				nextTime: depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				leaveIn: minsLeft <= 0 ? "now" : `${minsLeft}m`,
				departureTime: depTime.toISOString()
			};
		});
		
		res.json({
			towerId: towerId,
			stopSlug: towerConfig.stop_slug,
			lineName: towerConfig.line_name,
			timestamp: new Date().toISOString(),
			departures
		});
	} catch (err) {
		console.error("Error fetching tower departures:", err);
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/gateway/:gatewayId/departures", async (req, res) => {
	try {
		const gatewayId = req.params.gatewayId;
		const gatewayConfig = await pidDao.getGatewayConfig(gatewayId);
		
		const displayData = [];
		
		for (const tower of gatewayConfig.towers) {
			try {
				const data = await pidDao.fetchDeparturesFromPID(
					tower.stop_gtfs_id,
					tower.line_name
				);
				
				const departures = (data.departures || []).map(d => {
					const depTime = new Date(d.departure_timestamp?.actual || d.departure_timestamp?.planned);
					const minsLeft = Math.round((depTime - new Date()) / 60000);
					return {
						lineNumber: d.route?.short_name || tower.line_name,
						lineDirection: d.route?.long_name || d.direction || "",
						stopName: tower.stop_name || "",
						nextTime: depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
						leaveIn: minsLeft <= 0 ? "now" : `${minsLeft}m`
					};
				});
				
				displayData.push({
					towerId: tower.tower_id,
					departures
				});
			} catch (err) {
				console.error(`Failed for tower ${tower.tower_id}:`, err.message);
				displayData.push({
					towerId: tower.tower_id,
					departures: [],
					error: err.message
				});
			}
		}
		
		res.json({
			timestamp: new Date().toISOString(),
			displayData
		});
	} catch (err) {
		console.error("Error fetching gateway departures:", err);
		res.status(500).json({ error: err.message });
	}
});

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Legacy endpoints
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

app.use("/dbtest", async (req, res) => {
	try {
		const result = await pgClient.query("SELECT NOW()");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send("DB error");
	}
});

// Start server
startServer();