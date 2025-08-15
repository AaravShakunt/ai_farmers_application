# Weather API Integration Setup

This document provides instructions for setting up the weather API, mandi prices, and kisan schemes integration in the farmers application.

## Overview

The application now includes three new API services:

1. **Weather API** - Real-time weather data using Open-Meteo (free, no API key required)
2. **Mandi Prices API** - Market prices from data.gov.in (requires API key) with fallback mock data
3. **Kisan Schemes API** - Government schemes from data.gov.in (requires API key) with comprehensive fallback data

## API Services Created

### 1. Weather API (`src/services/weatherApi.ts`)

**Features:**
- Uses Open-Meteo free weather API (no API key required)
- 30-minute caching in localStorage
- 7-day weather forecast
- Current weather conditions
- Automatic fallback data if API fails

**Configuration:**
- No setup required - works out of the box
- Default location: Delhi (28.6139, 77.2090)
- Can be customized by passing lat/lng to `fetchWeatherData(lat, lng)`

### 2. Mandi Prices API (`src/services/mandiPricesApi.ts`)

**Features:**
- Integration with data.gov.in market prices API
- 7-day caching in localStorage
- Top commodities: Wheat, Rice, Tomato, Onion, Potato, Cotton, etc.
- Price trend indicators
- Comprehensive mock data fallback

**Setup:**
1. Get API key from https://data.gov.in/
2. Add to environment variables:
   ```bash
   REACT_APP_DATA_GOV_IN_API_KEY=your_api_key_here
   ```
3. If no API key is provided, the service will use realistic mock data

### 3. Kisan Schemes API (`src/services/kisanSchemesApi.ts`)

**Features:**
- Integration with data.gov.in schemes data
- 7-day caching in localStorage
- Comprehensive database of 10+ major schemes including:
  - PM-KISAN (₹6,000 annually)
  - PMFBY (Crop Insurance)
  - PMKSY (Irrigation)
  - Soil Health Card Scheme
  - Kisan Credit Card
  - And more...

**Setup:**
1. Same API key as mandi prices (data.gov.in)
2. Add to environment variables:
   ```bash
   REACT_APP_DATA_GOV_IN_API_KEY=your_api_key_here
   ```
3. Comprehensive mock data includes real scheme details if API unavailable

## Environment Variables Setup

Create a `.env` file in the frontend root directory:

```env
# Data.gov.in API Key (required for mandi prices and kisan schemes)
REACT_APP_DATA_GOV_IN_API_KEY=your_api_key_here
```

## Getting API Keys

### Data.gov.in API Key

1. Visit https://data.gov.in/
2. Sign up for an account
3. Navigate to "API" section
4. Request API access
5. Use the provided API key in your environment variables

**Note:** If you don't have an API key, the application will work perfectly with comprehensive mock data.

## Updated Components

### WeatherCard (`src/components/home/WeatherCard.tsx`)
- Now uses real weather API data
- Falls back to Open-Meteo free service
- Automatic caching and error handling

### PricesCard (`src/components/home/PricesCard.tsx`)
- Now uses real mandi prices from government API
- Dynamic crop list based on actual market data
- Price trend indicators
- Fallback to comprehensive mock data

### GovernmentSchemesCard (`src/components/home/GovernmentSchemesCard.tsx`)
- Now displays real government schemes
- Budget information and eligibility details
- Comprehensive scheme database
- Application links and contact information

## Cache Management

All APIs implement intelligent caching:

- **Weather**: 30 minutes (frequent updates needed)
- **Mandi Prices**: 7 days (prices change daily, but not critical)
- **Kisan Schemes**: 7 days (schemes are long-term)

### Manual Cache Clearing

```typescript
import { clearWeatherCache } from './services/weatherApi'
import { clearMandiCache } from './services/mandiPricesApi'
import { clearSchemesCache } from './services/kisanSchemesApi'

// Clear all caches
clearWeatherCache()
clearMandiCache()
clearSchemesCache()
```

## API Endpoints Used

### Open-Meteo Weather API
```
https://api.open-meteo.com/v1/forecast
```
- Free, no registration required
- Reliable and fast
- Comprehensive weather data

### Data.gov.in APIs
```
https://api.data.gov.in/resource/{resource_id}
```
- Requires API key
- Government-verified data
- Rate limits apply

## Error Handling

All services include comprehensive error handling:

1. **Network failures**: Automatic fallback to cached data
2. **API unavailable**: Switch to mock data
3. **Invalid responses**: Log error and use defaults
4. **Rate limits**: Respect API limits with caching

## Testing the Integration

1. **Weather**: Should work immediately (no API key needed)
2. **Mandi Prices**: Test with and without API key
3. **Kisan Schemes**: Comprehensive data available even without API

## Production Considerations

1. **API Keys**: Use environment variables, never commit keys to git
2. **Rate Limits**: Respect API rate limits with proper caching
3. **Error Monitoring**: Monitor API failures and fallback usage
4. **Performance**: Cache is optimized for minimal storage usage

## Support

- **Open-Meteo**: https://open-meteo.com/
- **Data.gov.in**: https://data.gov.in/help
- **API Issues**: Check network connectivity and API key validity

The integration is designed to be robust and work seamlessly whether APIs are available or not, ensuring a great user experience for farmers.