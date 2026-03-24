import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "node:fs/promises";
import { updateData } from "./src/stop_data/updateData.js";
import { updateTrieData } from "./src/stop_data/helpers/updateTrieData.js";
import { scheduler } from "./src/jobs/scheduler.js";
import schedule from 'node-schedule';

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const API_KEY = process.env.API_KEY;

// Demo data - used as fallback when real data is not available
const DEMO_STOPS = [
	{ id: '1', name: 'Nádraží Holešovice', type: 'metro', lines: ['C'] },
	{ id: '2', name: 'Můstek', type: 'metro', lines: ['A', 'B'] },
	{ id: '3', name: 'Karlín', type: 'tram', lines: ['3', '8'] },
	{ id: '4', name: 'Hlavní nádraží', type: 'bus', lines: ['100', '110'] },
];

const app = express();
app.use(express.json());
app.use(cors({
	origin: CLIENT_URL
}));

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
			throw new Error(`Stop ${id} not found`); // TODO: add status codes

		res.send(stop);
	} catch (err) {
		console.error(err);
		res.send(err);
	}
});

// testing endpoint without saving data
// https://api.golemio.cz/v2/public/departureboards?stopIds={"0": ["U474Z6P"]}&limit=1&routeShortNames=136&minutesAfter=60&minutesBefore=-10
// plus the X-Access-Token
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

// adds a stop and schedules it
app.put("/addStop", async (req, res) => {
	try {
		const data = {
			offset: 10,
			stopName: "Vysočanská",
			stopId: "vysocanska",
			line: {
				id: 136,
				name: "136",
				type: "bus",
				direction: "Jižní Město",
				gtfsId: "U474Z6P"
			}
		};
		const msg = await createJob(data);
		res.send(msg);
	} catch (err) {
		console.error(err);
	}
})

// ============================================================================
// NEW API ENDPOINTS FOR FRONTEND
// ============================================================================

// In-memory storage for saved stops (in production, use a database)
let savedStops = [];

// Load saved stops from file if exists
async function loadSavedStops() {
	try {
		const data = await fs.readFile("./data/savedStops.json", "utf8");
		savedStops = JSON.parse(data);
	} catch (err) {
		// File doesn't exist yet, start with empty array
		savedStops = [];
	}
}

// Save stops to file
async function saveSavedStops() {
	await fs.writeFile("./data/savedStops.json", JSON.stringify(savedStops, null, 2));
}

// Initialize saved stops
loadSavedStops();

/**
 * GET /api/stops
 * Returns all available stops for the explore screen
 * Frontend calls this to display the list of stops
 */
app.get("/api/stops", async (req, res) => {
	try {
		// Try to read from trieData.json first
		let stops = [];
		try {
			const trieData = JSON.parse(await fs.readFile("./data/trieData.json", "utf8"));
			// trieData contains stop names as keys
			stops = Object.keys(trieData).map((name, index) => ({
				id: `stop_${index}`,
				name: name,
				type: 'bus', // Default type, will be updated with actual data
				lines: []
			}));
		} catch (e) {
			// If no trie data, return sample stops for demo
			stops = [...DEMO_STOPS];
		}
		res.json(stops);
	} catch (err) {
		console.error('Error fetching stops:', err);
		res.status(500).json({ error: 'Failed to fetch stops' });
	}
});

/**
 * GET /api/stops/search?q=query
 * Search stops by name prefix (uses Trie for fast searching)
 * Frontend calls this when user types in search bar
 */
app.get("/api/stops/search", async (req, res) => {
	try {
		const query = req.query.q || '';
		if (!query) {
			return res.json([]);
		}

		// Try to use trie data for searching
		let results = [];
		try {
			const trieData = JSON.parse(await fs.readFile("./data/trieData.json", "utf8"));
			// Simple prefix matching (in production, use actual Trie)
			const lowerQuery = query.toLowerCase();
			results = Object.keys(trieData)
				.filter(name => name.toLowerCase().includes(lowerQuery))
				.slice(0, 20) // Limit to 20 results
				.map((name, index) => ({
					id: `stop_${index}`,
					name: name,
					type: 'bus',
					lines: []
				}));
		} catch (e) {
			// Fallback: return demo results
			const lowerQuery = query.toLowerCase();
			results = DEMO_STOPS.filter(stop => 
				stop.name.toLowerCase().includes(lowerQuery)
			);
		}
		res.json(results);
	} catch (err) {
		console.error('Error searching stops:', err);
		res.status(500).json({ error: 'Failed to search stops' });
	}
});

/**
 * GET /api/stops/:id
 * Get detailed information about a specific stop
 * Frontend calls this when user selects a stop
 */
app.get("/api/stops/:id", async (req, res) => {
	try {
		const { id } = req.params;
		
		// Try to get stop details from stopDetails.json
		let stopDetails = null;
		try {
			const allDetails = JSON.parse(await fs.readFile("./data/stopDetails.json", "utf8"));
			stopDetails = allDetails.find(stop => stop.id === id);
		} catch (e) {
			// Return demo stop
		}

		if (stopDetails) {
			return res.json(stopDetails);
		}

		// Return demo data if no real data
		res.json({
			id: id,
			name: 'Vysočanská',
			type: 'bus',
			gtfsId: 'U474Z6P',
			lines: [
				{ id: 136, name: '136', direction: 'Jižní Město' },
				{ id: 186, name: '186', direction: 'Poliklinika Vysočany' }
			]
		});
	} catch (err) {
		console.error('Error fetching stop details:', err);
		res.status(500).json({ error: 'Failed to fetch stop details' });
	}
});

/**
 * POST /api/departures
 * Get real-time departures for a specific stop and line
 * Frontend calls this to display upcoming departures
 * 
 * Request body:
 * {
 *   "gtfsId": "U474Z6P",      // Stop's GTFS ID (from Prague transit API)
 *   "lineName": "136",       // Line number (e.g., "136", "A", "C")
 *   "minutesBefore": -10,    // How many minutes before now to show
 *   "minutesAfter": 60        // How many minutes after now to show
 * }
 */
app.post("/api/departures", async (req, res) => {
	try {
		// Validate API key is configured
		if (!API_KEY) {
			console.error('API_KEY environment variable is not set');
			return res.status(500).json({ error: 'Server configuration error: API key not configured' });
		}

		const { gtfsId, lineName, minutesBefore = -10, minutesAfter = 60 } = req.body;

		if (!gtfsId || !lineName) {
			return res.status(400).json({ error: 'gtfsId and lineName are required' });
		}

		// Validate time bounds
		const validMinutesBefore = Math.max(-60, Math.min(0, minutesBefore ?? -10));
		const validMinutesAfter = Math.min(120, Math.max(1, minutesAfter ?? 60));

		// Call Prague transit API to get real-time departures
		const url = `https://api.golemio.cz/v2/public/departureboards?${new URLSearchParams({
			stopIds: JSON.stringify({"0": [gtfsId]}),
			limit: 10,
			routeShortNames: lineName,
			minutesAfter: validMinutesAfter,
			minutesBefore: validMinutesBefore
		})}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"X-Access-Token": API_KEY
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch departures from transit API');
		}

		const data = await response.json();
		
		// Transform the API response to a simpler format for frontend
		const departures = (data.departures || []).map(dep => ({
			id: dep.trip?.tripId || Math.random().toString(),
			lineName: dep.route?.short_name || lineName,
			direction: dep.route?.long_name || dep.trip?.trip_headsign || 'Unknown',
			expectedDeparture: dep.expected_departureUtc,
			realTime: dep.actual_relative_time || null,
			type: dep.route?.type || 'bus'
		}));

		res.json({
			stopId: gtfsId,
			lineName: lineName,
			departures: departures
		});
	} catch (err) {
		console.error('Error fetching departures:', err);
		res.status(500).json({ error: 'Failed to fetch departures', details: err.message });
	}
});

/**
 * GET /api/savedStops
 * Get all saved/starred stops for the user
 * Frontend calls this to show the user's tracked stops on home screen
 */
app.get("/api/savedStops", async (req, res) => {
	try {
		res.json(savedStops);
	} catch (err) {
		console.error('Error fetching saved stops:', err);
		res.status(500).json({ error: 'Failed to fetch saved stops' });
	}
});

/**
 * POST /api/savedStops
 * Save a new stop to track
 * Frontend calls this when user adds a stop to their favorites
 * 
 * Request body:
 * {
 *   "name": "Vysočanská",
 *   "gtfsId": "U474Z6P",
 *   "line": { "name": "136", "direction": "Jižní Město" }
 * }
 */
app.post("/api/savedStops", async (req, res) => {
	try {
		const { name, gtfsId, line } = req.body;

		if (!name || !gtfsId) {
			return res.status(400).json({ error: 'name and gtfsId are required' });
		}

		const newStop = {
			id: Date.now().toString(),
			name,
			gtfsId,
			line: line || null,
			createdAt: new Date().toISOString()
		};

		savedStops.push(newStop);
		await saveSavedStops();

		// Also schedule a job for this stop if line is provided
		if (line) {
			await createJob({
				offset: 10,
				stopName: name,
				stopId: newStop.id,
				line: {
					id: Date.now(),
					name: line.name,
					type: 'bus',
					direction: line.direction,
					gtfsId: gtfsId
				}
			});
		}

		res.status(201).json(newStop);
	} catch (err) {
		console.error('Error saving stop:', err);
		res.status(500).json({ error: 'Failed to save stop' });
	}
});

/**
 * DELETE /api/savedStops/:id
 * Remove a saved stop
 * Frontend calls this when user removes a stop from favorites
 */
app.delete("/api/savedStops/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const initialLength = savedStops.length;
		
		savedStops = savedStops.filter(stop => stop.id !== id);

		if (savedStops.length === initialLength) {
			return res.status(404).json({ error: 'Stop not found' });
		}

		await saveSavedStops();
		res.json({ message: 'Stop removed successfully' });
	} catch (err) {
		console.error('Error removing stop:', err);
		res.status(500).json({ error: 'Failed to remove stop' });
	}
});

// ============================================================================
// END OF NEW API ENDPOINTS
// ============================================================================

app.listen(SERVER_PORT, () => {
	console.log(`Server listening on port ${SERVER_PORT}`);
});