import { pgClient } from "../db/postgres.js";

export const stopsDao = {

	async getTrieData() {
		const result = await pgClient.query(`
			SELECT id, slug, name FROM stops
		`);
		return result;
	},

	async getStopBySlug(slug) {
		const result = await pgClient.query(`
			SELECT 
				s.id, s.slug, s.name, s.display_ascii,
				l.id as line_id, l.name as line_name, l.type, l.direction, l.gtfs_id, l.display_ascii as line_ascii, l.pid_id
			FROM stops s
			JOIN stops_lines sl ON sl.stop_id = s.id
			JOIN lines l ON l.id = sl.line_id
			WHERE s.slug = $1
		`, [slug]);
		return result;
	}
}