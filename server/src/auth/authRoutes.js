import { verifyToken } from "./jwtService.js";

async function auth(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader)
		return res.status(401).json({ message: "Missing token" });

	const token = authHeader.split(" ")[1];
	if (!token) return res.status(401).json({ message: "Malformed token" });

	try {
		const decoded = await verifyToken(token);
		req.user = decoded;	// note: this is the only true source of user credentials. Don't use req.body for authentication!
		next();
	} catch (err) {
		res.status(401).json({ message: "Invalid or expired token" });
	}
};

export default auth;