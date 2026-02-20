20/2/2026
Current state:
Includes automatic data updating, structuring and some test routes.

Switch to server/, run npm install, and then npm start. It'll automatically download the necessary data from PID.

The data/ folder contains 3 files.   
`stops.json` is raw data from PID containing all the stops in the entire Prague region (not just Prague city).   
`stopDetails.json` contains only the stops within Prague, each one containing only its name, id (lowercase latin characters), and all the lines. All names and ids are unique.   
`trieData.json` contains only names and ids of each stop, intended to be used on the frontend for quickly autosuggesting stops by using a trie (prefix tree). It doesn't work right now lmfao

There are a few test routes in app.js:   
`/trieData` to get condensed data from `trieData.json`,
`/stopGroups` to get all the lines in a given stop by id (visible in `trieData.json` and `stopDetails.json`),   
`/bustest` which gets a stop from PID


You need to create a .env file and add `SERVER_PORT=3000` and `API_KEY`, I'll send the key.

