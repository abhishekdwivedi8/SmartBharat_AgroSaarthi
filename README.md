# Kisan Sathi Digital Bharat 🌾

**AI-Powered Digital Farming Platform for Indian Farmers**

A comprehensive agricultural technology platform that empowers farmers with AI-driven insights, real-time market data, multilingual voice assistance, and offline capabilities.

## 🚀 Features

### Core Features
- **🤖 AI Crop Health Detection** - Online (Gemini AI) & Offline modes
- **🎤 Multilingual Voice Assistant** - 12+ Indian languages supported
- **📊 Live Market Prices** - Real-time mandi prices with AI predictions
- **🌤️ Weather Advisory** - Location-based weather and farming advice
- **📅 Smart Crop Calendar** - AI-generated farming schedules
- **💰 Subsidy Finder** - Government scheme recommendations
- **🎮 Educational Games** - Gamified learning with rewards
- **📱 PWA Support** - Works offline, installable on mobile

### AI Advisories
- **AgriMind AI** - Seasonal crop demand prediction
- **AgriPredict** - Export market advisory
- **SeedSense AI** - Fertilizer & seed recommendations
- **FarmSage** - Demand forecasting for local & export markets

### Technical Features
- **Offline-First Architecture** - Works without internet
- **Navigation State Persistence** - Resume where you left off
- **Real-time Data Sync** - Background synchronization
- **Multi-language Support** - Hindi, Tamil, Telugu, Bengali, and more
- **Responsive Design** - Works on all devices

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **AI Integration**: Google Gemini API
- **Weather API**: OpenWeatherMap
- **Offline Storage**: IndexedDB, Service Workers
- **PWA**: Web App Manifest, Service Worker

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kisan-sathi-digital-bharat-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

The application uses universal API keys that are already configured:

- **Gemini AI**: `AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k`
- **OpenWeather**: `b8699df2df1e9e43934ff010d49c627d`

No additional environment configuration needed!

### Build for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 📱 PWA Installation

1. Open the app in a modern browser
2. Look for the "Install" prompt or use browser menu
3. The app will be installed as a native-like application
4. Works offline with cached data and basic functionality

## 🌐 Offline Capabilities

### What Works Offline:
- Basic crop health analysis (sample data)
- Cached weather information
- Saved crop calendar
- Voice assistant (with cached responses)
- Market price history
- Navigation state persistence

### Offline-to-Online Sync:
- Crop analysis data
- Voice queries
- User preferences
- Activity logs

## 🎯 Key Components

### 1. Crop Health Detection (`/crop-health`)
- **Online Mode**: Uses Gemini AI for real-time analysis
- **Offline Mode**: Ready for ML model integration
- Supports image upload and camera capture
- Provides treatment recommendations

### 2. Voice Assistant (`/voice`)
- Supports 12+ Indian languages
- Real-time speech recognition
- AI-powered responses via Gemini
- Text-to-speech in multiple languages

### 3. Market Prices (`/prices`)
- Live mandi prices
- AI-powered market predictions
- Export opportunities
- Price trend analysis

### 4. Weather Advisory (`/weather`)
- Location-based weather data
- Crop-specific recommendations
- UV index and soil conditions
- Weather alerts and notifications

### 5. Smart Dashboard (`/dashboard`)
- Personalized farmer dashboard
- Quick actions and shortcuts
- AI tips and recommendations
- Activity tracking

## 🔄 Navigation State Management

The app automatically saves your progress and allows you to continue where you left off:

- Last visited page is remembered
- Form data is preserved
- Analysis results are cached
- Works across browser sessions

## 🌍 Multilingual Support

**Supported Languages:**
- Hindi (हिन्दी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)
- Assamese (অসমীয়া)
- Urdu (اردو)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Self-hosted
```bash
npm run build
# Serve dist/ folder with any static file server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent crop analysis
- OpenWeatherMap for weather data
- Supabase for backend infrastructure
- shadcn/ui for beautiful components
- The farming community for inspiration

---

**Built with ❤️ for Indian Farmers**

*Empowering agriculture through technology*
