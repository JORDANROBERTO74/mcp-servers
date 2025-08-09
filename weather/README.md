# Weather MCP Server

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/jordanroberto74/mcp-servers)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-Compatible-blue)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that provides weather information using the National Weather Service (NWS) API. This server offers tools to get weather alerts and forecasts for locations within the United States.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Get Weather Alerts](#1-get-weather-alerts-get_alerts)
  - [Get Weather Forecast](#2-get-weather-forecast-get_forecast)
- [API Integration](#api-integration)
- [Examples](#examples)
- [Development](#development)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Version History](#version-history)

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
- **User-Agent**: Includes contact info per NWS policy (e.g., `weather-app/1.0 (contact: you@example.com)`).

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
- `zod`: Schema validation

**Development Dependencies:**

- `@types/node`: TypeScript definitions for Node.js
- `typescript`: TypeScript compiler
- `shx`: Cross-platform shell utilities (used for chmod in build)

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

## Examples

### Using with MCP Client

**Get Weather Alerts for California:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_alerts",
    "arguments": {
      "state": "CA"
    }
  }
}
```

**Get Forecast for Los Angeles:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_forecast",
    "arguments": {
      "latitude": 34.0522,
      "longitude": -118.2437
    }
  }
}
```

### Using with Shell Script

```bash
#!/bin/bash
# weather-check.sh

echo "Getting weather alerts for Texas..."
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_alerts",
    "arguments": {"state": "TX"}
  }
}' | node build/index.js

echo "Getting forecast for Austin, TX..."
echo '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_forecast",
    "arguments": {"latitude": 30.2672, "longitude": -97.7431}
  }
}' | node build/index.js
```

## Troubleshooting

### Common Issues

**Problem: "Network error" or "Connection refused"**

- **Solution**: Check your internet connection and verify the NWS API is accessible
- **Test**: Try accessing `https://api.weather.gov` in your browser

**Problem: "Invalid state code" error**

- **Solution**: Ensure you're using a valid two-letter US state code (e.g., "CA", not "California")
- **Valid codes**: AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY

**Problem: "Invalid coordinates" error**

- **Solution**: Verify latitude is between -90 and 90, longitude between -180 and 180
- **US Bounds**: Latitude: ~25 to 49, Longitude: ~-125 to -66

**Problem: "No data available" response**

- **Solution**: The location may be outside US territories or NWS coverage area
- **Alternative**: Try nearby coordinates within the continental US

**Problem: Server not responding**

- **Solution**:
  1. Check if the server is running: `ps aux | grep node`
  2. Restart the server: `npm run build && node build/index.js`
  3. Check for port conflicts

### Debug Mode

Run the server with debug output:

```bash
# Enable debug logging
DEBUG=weather:* node build/index.js

# Or with verbose output
node build/index.js 2>&1 | tee debug.log
```

## FAQ

### General Questions

**Q: Can I get weather data for locations outside the US?**
A: No, this server only supports US locations as it uses the National Weather Service API, which only covers United States territories.

**Q: How accurate are the forecasts?**
A: The forecasts come directly from the National Weather Service, which is the official weather service of the United States. Accuracy varies but is generally reliable for short-term forecasts.

**Q: How often is the weather data updated?**
A: The NWS updates weather data continuously throughout the day. Forecasts are typically updated every few hours, while alerts are updated as conditions change.

**Q: Is there a rate limit on the NWS API?**
A: The NWS API has standard rate limits. For normal usage, you shouldn't encounter issues, but avoid making hundreds of requests per minute.

### Technical Questions

**Q: What coordinate formats are supported?**
A: The server accepts decimal degrees format (e.g., 34.0522, -118.2437). It uses 4 decimal places for precision.

**Q: Can I get historical weather data?**
A: No, this server only provides current alerts and forecasts. The NWS API doesn't provide historical weather data through this interface.

**Q: How do I convert addresses to coordinates?**
A: You'll need to use a geocoding service (like Google Maps API or OpenStreetMap Nominatim) to convert addresses to latitude/longitude coordinates first.

**Q: Why am I getting empty results for some locations?**
A: The location might be outside the NWS coverage area, in a marine/offshore area, or the coordinates might be invalid.

### Integration Questions

**Q: Can I use this server with Claude Desktop?**
A: Yes, add it to your `claude_desktop_config.json` file following the MCP server configuration format.

**Q: How do I integrate this with other applications?**
A: Use the MCP protocol to communicate with the server, or create wrapper scripts that call the server and process the responses.

**Q: Can I modify this server to use other weather APIs?**
A: Yes, the server is open source. You can modify the API endpoints and response parsing to work with other weather services.

## Version History

- **v1.0.0**: Initial release with alerts and forecast functionality

---

_This project is not affiliated with the National Weather Service. Weather data is provided by the NWS API for informational purposes only._
