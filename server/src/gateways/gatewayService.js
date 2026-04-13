import { gatewayDao } from "./gatewayDao.js";

// TODO: verify input + sanitize, throw errors

export const gatewayService = {
	async register(data) {
		const response = await gatewayDao.register(data);
		

		return response.rows[0];
	}
};
