import schedule from 'node-schedule';
import fs from 'node:fs/promises';

// const job = schedule.scheduleJob({hour: 14}, function() {
// 	console.log(`test job 14`);
// });

// const sJob = schedule.scheduleJob('*/1 * * * * *', function() {
// 	console.log('every second');
// });

// export const jobList = [
// 	job, sJob
// ];

export const jobList = [];