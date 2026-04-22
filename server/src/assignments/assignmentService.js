import { assignmentDao } from "./assignmentDao.js";

// TODO: add input validation

export const assignmentService = {
	
	async create(towerId, newAssignment) {
		// check if it already has 2 assignments, if so then tell the user to delete one
		const existing = await assignmentDao.getByTowerId(towerId);
		if (existing.rows.length >= 2) {
			throw new Error("Tower already has the maximum number of stops. Delete one first.");
		}

		// TODO: when creating: ensure that the provided stop + line combination actually exists

		const result = await assignmentDao.create(towerId, newAssignment);

		return result.rows[0];
	},

	async deleteAllByTowerId(towerId) {
		const result = await assignmentDao.deleteAllByTowerId(towerId);
		
		return result.rowCount;
	},

	async deleteById(assignmentId) {
		const result = await assignmentDao.deleteById(assignmentId);
		return result.rowCount;
	}
};
