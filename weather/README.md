# Weather MCP Server

A Model Context Protocol (MCP) server that provides weather information using the National Weather Service (NWS) API. This server offers tools to get weather alerts and forecasts for locations within the United States.

## Features

- **Weather Alerts**: Get active weather alerts for any US state
- **Weather Forecasts**: Get detailed weather forecasts for specific coordinates
- **US Coverage**: Full coverage of United States territories
- **Real-time Data**: Direct integration with NWS API for up-to-date information

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

This MCP server is designed to be used with MCP-compatible clients. It provides two main tools:

### 1. Get Weather Alerts (`get_alerts`)

Retrieves active weather alerts for a specific US state.

**Parameters:**

- `state` (string): Two-letter state code (e.g., "CA", "NY", "TX")

**Example Response:**

```
Active alerts for CA:

Event: Severe Thunderstorm Warning
Area: Los Angeles County
Severity: Severe
Status: Actual
Headline: Severe Thunderstorm Warning issued for Los Angeles County
---
```

### 2. Get Weather Forecast (`get_forecast`)

Retrieves detailed weather forecast for specific coordinates.

**Parameters:**

- `latitude` (number): Latitude coordinate (-90 to 90)
- `longitude` (number): Longitude coordinate (-180 to 180)

**Example Response:**

```
Forecast for 34.0522, -118.2437:

Tonight:
Temperature: 65°F
Wind: 5 mph SW
Partly cloudy with a low around 65°F
---
Wednesday:
Temperature: 78°F
Wind: 10 mph W
Sunny with a high near 78°F
---
```

## API Integration

This server integrates with the National Weather Service (NWS) API:

- **Base URL**: `https://api.weather.gov`
- **Data Format**: GeoJSON
- **Coverage**: United States only
- **Rate Limits**: NWS API standard limits apply

## Development

### Project Structure

```
weather/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output
├── package.json          # Project configuration
└── tsconfig.json         # TypeScript configuration
```

### Building

To compile TypeScript to JavaScript:

```bash
npm run build
```

### Dependencies

**Production Dependencies:**

- `@modelcontextprotocol/sdk`: MCP server implementation
- `node-fetch`: HTTP client for API requests
- `zod`: Schema validation

**Development Dependencies:**

- `@types/node`: TypeScript definitions for Node.js
- `typescript`: TypeScript compiler

## Limitations

- **US Only**: This server only works with locations within the United States
- **NWS API Dependency**: Requires internet connection and NWS API availability
- **Coordinate Precision**: Uses 4 decimal places for coordinate precision

## Error Handling

The server handles various error scenarios:

- Network connectivity issues
- Invalid coordinates
- API service unavailability
- Invalid state codes
- Missing or malformed API responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues related to:

- **Weather Data**: Contact National Weather Service
- **MCP Protocol**: Refer to Model Context Protocol documentation
- **Server Issues**: Check the project repository

## Version History

- **v1.0.0**: Initial release with alerts and forecast functionality

---

_This project is not affiliated with the National Weather Service. Weather data is provided by the NWS API for informational purposes only._
