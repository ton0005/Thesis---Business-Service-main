# Business Trend Analysis Platform
A modern web application for analyzing market trends and consumer sentiment through social media data analysis.

<img alt="Business Trend Analysis Platform" src="https://i.imgur.com/placeholder-image.png">

## Overview
This Business Trend Analysis Platform helps companies understand market trends and consumer sentiment through YouTube data analysis. It processes video content and comments to extract insights, visualize trends, and provide actionable recommendations for business decisions.

## Features
- **Keyword Analysis**: Search and analyze trends for specific keywords or products
- **Date Range Selection**: Customize your analysis timeframe
- **Interactive Visualizations**:
  - Trend charts showing interest over time
  - Sentiment distribution analysis
- **Data Insights**: AI-powered analysis of market trends and consumer sentiment
- **Recommendations**: Actionable business recommendations based on data analysis
- **Export Functionality**: Download analysis results in CSV format
- **Dark Mode Support**: Comfortable viewing in any environment

## Technical Architecture

### Frontend
- Framework: Next.js (React)
- Styling: Tailwind CSS
- Charts: Chart.js
- UI Components: Custom components with light/dark mode support

### Services Layer
The application uses a service-oriented architecture with:

- **analysisService.ts**: Business logic for analysis operations
- **api.ts**: API communication handling
- **types.ts**: TypeScript definitions for data models

### Simulation Layer (Development)
- Mock data for development and testing
- API response simulation with realistic delays
- Keyword-based mock data selection

## Project Structure
```
product-market-analysis/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── services/     # Service layer
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── mock/             # Mock data for development
```
![1](image.png)
![2](image-1.png)
## Data Flow
1. **User Input**: Users enter keywords and parameters in the analysis form
2. **Service Request**: Components call the analysis service
3. **API Communication**: Service layer communicates with backend/simulation
4. **Data Processing**: Results are processed and formatted
5. **Visualization**: Data is displayed through interactive charts
6. **Export**: Users can export results for further analysis

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/cnmzsjbz199328/businessService.git
   cd product-market-analysis
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at http://localhost:3000.

### Building for Production
1. Build the application
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server
   ```bash
   npm start
   # or
   yarn start
   ```

## Environment Variables
Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_USE_MOCK_DATA=true
```

For development, the application will use mock data by default.

## Customization

### Themes
The application supports light and dark modes. Customize themes in:

- **tailwind.config.js**: Color definitions
- **globals.css**: Base styles and theme variables

## Documentation
For detailed API documentation, see the [API Documentation](./apiDocument.md) file.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.