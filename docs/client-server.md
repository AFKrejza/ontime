# Client-Server API Contract

This document describes the backend endpoints used by the frontend for stop autocomplete, stop details, and creating a tower assignment.

## Base URL

- `http://localhost:3000`

## 1. Get all stops for autocomplete

- Method: `GET`
- Endpoint: `/trieData`

Returns a list of stops with basic metadata for autocomplete.

Example response:

```json
[
  { "name": "Albertov", "id": "albertov" },
  { "name": "Ametystová", "id": "ametystova" },
  { "name": "Amforová", "id": "amforova" }
]
```

This endpoint is used by the frontend search input to provide stop suggestions.

## 2. Get stop details with lines

- Method: `GET`
- Endpoint: `/stopGroups/:id`

Returns detailed information for a selected stop, including the stop name, stop id, and its available lines grouped by transport type.

Example response:

```json
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

The frontend uses this endpoint to load the selected stop's available lines and allow the user to pick one.

## 3. Add an assignment to a tower

- Method: `PUT`
- Endpoint: `/addStop`

Creates a complete tower assignment with stop, line, and walking offset data.

Request body:

```json
{
  "offset": 10,
  "stopName": "Vysočanská",
  "stopId": "vysocanska",
  "line": {
    "id": 136,
    "name": "136",
    "type": "bus",
    "direction": "Sídliště Čakovice",
    "gtfsId": "U474Z5P"
  }
}
```

The server stores this configuration and schedules the selected stop line for tower monitoring.

## Notes

- The frontend can be built as a React web app and still use these endpoints.
- The backend is unchanged: these endpoints are already implemented in the server.
