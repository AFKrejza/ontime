import express from 'express';
import {createUser,registerDongle,registerTower,setStopForTower } from './db.js'; 

const router = express.Router();

//Create user
// POST http://localhost:3000/api/tower/user
// Body: { "username": "Alex" }
router.post('/user', (req, res) => {
    const { username } = req.body;
    createUser(username, (userId) => {
        res.status(201).json({ message: "User created", userId });
    });
});

// 2. Register dongle and connect it to the user || users 1:N dongles
// POST http://localhost:3000/api/tower/dongle
// Body: { "dongleId": "D-101", "userId": 1 }
router.post('/dongle', (req, res) => {
    const { dongleId, userId } = req.body;
    registerDongle(dongleId, userId);
    res.json({ message: `Attempted to connect dongle ${dongleId} to user ${userId}` });
});

// 3. Register new tower and connect it to existing towers(ref) only - all in one function || dongle 1:N towers
// POST http://localhost:3000/api/tower/register
// Body: { "towerId": "T-01", "towerName": "Kitchen Display", "dongleId": "D-101" }
router.post('/register', (req, res) => {
    const { towerId, towerName, dongleId } = req.body;
    registerTower(towerId, towerName, dongleId);
    res.json({ message: `Registration process started for tower ${towerId}` });
});

// 4. Set stop for tower table, only existing stop, from stops(id) table, can be added
// PUT http://localhost:3000/api/tower/stop
// Body: { "towerId": "T-01", "stopId": "albertov" }
router.put('/stop', (req, res) => {
    const { towerId, stopId } = req.body;
    setStopForTower(towerId, stopId);
    res.json({ message: `Tower ${towerId} update requested for stop ${stopId}` });
});

export default router;