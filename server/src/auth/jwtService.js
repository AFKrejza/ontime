import jwt from "jsonwebtoken";

export async function generateToken(payload) {
	return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1w"});
};

export async function verifyToken(token) {
	return jwt.verify(token, process.env.JWT_SECRET);
};
