import { userDao } from "../users/userDao.js";
import { hashPassword, comparePassword } from "./hashService.js";
import { generateToken } from "./jwtService.js";

export const authController = {

	async signup(req, res) {
		try {			
			const { userName, email, password } = req.body;
			const result = await userDao.findByEmail(email);
	
			if (result.rows[0]) {
				console.error("User already exists!");
				return res.status(409).json({ message: "User already exists!" });
			}
				
			const hashedPassword = await hashPassword(password);
			const data = {
				email: email,
				userName: userName,
				passwordHash: hashedPassword
			};
	
			let user = await userDao.create(data);
			user = user.rows[0];
			console.log(`User ${email} registered`);
			console.log(user);
			const token = await generateToken({ id: user.id });
			res.status(201).json({ message: "User registered.", token });
		} catch (error) {
			console.error(error);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: error.message });
		}
	},
	
	async login(req, res) {
		try {
			const { email, password } = req.body;
			let result = await userDao.findByEmail(email);
			result = result.rows[0];
			const user = {
				id: result.id,
				userName: result.username,
				passwordHash: result.password_hash,
				email: result.email
			};
	
			if (!user)
				return res.status(400).json({ message: "Invalid email" });
	
			const checkPassword = await comparePassword(password, user.passwordHash);
			
			if (!checkPassword)
				return res.status(400).json({ message: "Invalid password" });
			
			const token = await generateToken({ id: user.id });
			
			res.json({ token });
		} catch (error) {
			console.error(error);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: error.message });
		}
	},

	async profile(req, res) {
		try {
			const id = req.user.id;
			const user = await userDao.getProfile(id);
			if (!user)
				return res.status(404).json({ message: "User not found" });
			res.json(user);
		} catch (error) {
			console.error(error);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: error.message });
		}
	},
};