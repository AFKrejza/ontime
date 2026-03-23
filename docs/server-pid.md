23/03/2026

# Fetch Live Data from PID

Uses the Public Departures (v2) endpoint.  
`https://api.golemio.cz/pid/docs/openapi/`

List of stops that's updated daily:  
`https://opendata.praha.eu/datasets/https%3A%2F%2Fapi.opendata.praha.eu%2Flod%2Fcatalog%2F6ac8381f-ea19-4ea9-8949-92076809dc5a`

Additional information:  
`https://pid.cz/en/opendata/`


## Fetch departures
Read the documentation here: `https://api.golemio.cz/pid/docs/openapi/`  
Since each gateway can support multiple towers, all their assignments should be combined into one request.
It seems like you can't filter by line when fetching more than one stop/gtfsId. So set the limit to like 30 (max), and then you'll have to filter the request to find which departures you need.  
We'll work with a maximum of 5 towers per gateway, or 10 assignments per gateway to keep things simple, since if a request exceeds 10,000 lines it gets paginated, which takes up another request. And we can only do 150 per minute. Setting the limit to 30 and having 10 assignments should keep it well below 10k lines.  
`server/src/jobs/scheduler.js -> addStops()` is a good starting point for this.

Try:  
`limit` set to 30  
`minutesAfter` to 60  
`offset` must be negative, and set a limit, like -30  

Headers: X-Access-Token api-key  
URL:
```
https://api.golemio.cz/v2/public/departureboards?
stopIds={"0": ["${gtfsId}"]}&
limit=${limit}&
routeShortNames=${name}&
minutesAfter=${minutesAfter}&
minutesBefore=${offset}
```

Working example for two different gtfsIds:  
Headers: X-Access-Token api-key  
```
https://api.golemio.cz/v2/public/departureboards
?stopIds={"0": ["U474Z6P"]}
&stopIds={"1": ["U474Z1P"]}
&limit=30
&minutesAfter=60
&minutesBefore=-10
```

Working example for one specific line:  
Headers: X-Access-Token api-key  
```
https://api.golemio.cz/v2/public/departureboards?
stopIds={"0": ["U474Z6P"]}
&limit=1
&routeShortNames=136
&minutesAfter=60
&minutesBefore=-10
```