import bcrypt from "bcryptjs";

export async function hashPassword(plainText) {
	return await bcrypt.hash(plainText, 10);
};

export async function comparePassword(plainText, hashedText) {

	return await bcrypt.compare(plainText, hashedText);
};