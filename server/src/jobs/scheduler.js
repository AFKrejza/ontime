import schedule from 'node-schedule';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';

const path = `./data/myStop.json`;
const cron = '*/30 * * * * *'; // 30 second interval - adjust for production needs

// only handles 1 stop!
export function scheduler() {
	const fetchJob = schedule.scheduleJob(cron, async function() {
		try {
			const data = await JSON.parse(await fs.readFile(path));
			await fetchStop(data);
		} catch (err) {
			if (err.code === "ENOENT")
				console.log(`No jobs found.`);
			else {
				console.error(`Error in reading myStops.json: ${err}`);
				throw new Error(err);
			}
		}
	});
}

export async function createJob(data) {
	const {stopName, stopId, line, offset} = data;
	const job = new Job(stopName, stopId, line, offset, cron);
	await fs.writeFile(path, JSON.stringify(job));
	return 'Created job';
}

async function fetchStop(job) {
	try {
		const gtfsId = job.line.gtfsId;
		const name = job.line.name;
		const offset = job.offset;
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
		// console.log(data[0][0]);
		console.log(`fetched ${name}`);
		return data;
	} catch (err) {
		console.error(err);
	}
}

// check ./jobExample.json
class Job {
	constructor(stopName, stopId, line, offset, cron) {
		this.stopName = stopName;
		this.stopId = stopId;
		this.line = line;
		this.offset = offset * -1;
		this.cron = cron;
	}
}