21/02/2026

The stop is saved in server/data/myStop.json.   
The server fetches the line's details once a minute. You can change this in `server/src/jobs/scheduler.js` by using the other `cron` global variable which makes a request each second.   

# How to change the scheduled stop

Endpoint:   
**/addStop**   
PUT request   
example body:   
```
{
  "offset": 10,
  "stopName": "Vysočanská",
  "stopId": "vysocanska",
  "line": {
    "id": 136,
    "name": "136",
    "type": "bus",
    "direction": "Jižní Město",
    "gtfsId": "U474Z6P"
  }
}
```

`offset` is the number of minutes it takes you to get to the stop. It must be a positive number from 0 to 30 inclusive (TODO: double check this).   
You can get the rest of the data with these 2 endpoints:

## How to get the data

**/trieData** returns an array with each stop's name and id. Partial example:   
```
[
  {
    "name": "Albertov",
    "id": "albertov"
  },
  {
    "name": "Ametystová",
    "id": "ametystova"
  },
  {
    "name": "Amforová",
    "id": "amforova"
  }
]
```


**/stopGroups/:id** returns all the stop's lines grouped by type. Partial example for **/stopGroups/vysocanska**:   
```
{
  "name": "Vysočanská",
  "id": "vysocanska",
  "lines": {
    "tram": [
      {
        "id": 12,
        "name": "12",
        "type": "tram",
        "direction": "Lehovec",
        "gtfsId": "U474Z2P"
      }
	],
	"bus": [
      {
        "id": 136,
        "name": "136",
        "type": "bus",
        "direction": "Sídliště Čakovice",
        "gtfsId": "U474Z5P"
      }
	]
  }
}
```

