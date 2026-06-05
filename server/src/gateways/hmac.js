import { gatewayDao } from "./gatewayDao.js";
import crypto, { getRandomValues } from "crypto";

export const HMAC = {

	async validate(gatewayId, signature, hashFields) {

		const { timestamp, requestType } = hashFields;

		const hashInput = gatewayId + "|" + timestamp + "|" + requestType;
		
		const res = await gatewayDao.getSecret(gatewayId);
		
		if (!res.rows[0]) throw new Error("No secret found. Generate one.");

		const secret = res.rows[0].hmac_secret;

		const hash = crypto.createHmac('sha256', secret).update(hashInput).digest('hex');
		console.log(hash);

		if (hash !== signature) {
			throw new Error("Invalid signature");
		}

		return true;

	},
	
	async generateSecret() {
		const newSecret = crypto.randomBytes(16).toString('hex');
		return newSecret;
	},

	async hash() {

	}
};
