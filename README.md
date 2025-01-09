# AI Review Radar <img src="public/review-radar.png" alt="AI Review Radar Icon" width="32" height="32" />

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4)](https://tailwindcss.com/)

AI Review Radar is an intelligent tool that analyzes Google Maps reviews to detect potential fake reviews and suspicious patterns. By leveraging advanced AI technology and data analysis, it helps businesses and consumers make more informed decisions.

![Demo Screenshot](public/demo.png)

## Features

- **Review Scraping**: Automatically extracts reviews from any Google Maps location
- **AI-Powered Analysis**: Uses GPT-4o-mini to analyze review patterns and detect suspicious activities
- **Comprehensive Metrics**: Provides detailed analysis through multiple dimensions
- **Real-time Processing**: Delivers instant results with visual representations
- **Multi-language Support**: Works with reviews in various languages

## How It Works

### 1. Data Collection
- Accepts Google Maps short URLs or full URLs
- Uses Puppeteer to scrape reviews, including:
  - User information
  - Review content
  - Ratings
  - Timestamps
  - Photos
  - Local guide status

### 2. AI Analysis Process

The AI analysis evaluates reviews based on five key dimensions:

#### a. Language Naturalness (0-100)
- Analyzes writing style consistency
- Detects machine-generated or templated content
- Evaluates language patterns and expressions

#### b. Content Relevance (0-100)
- Assesses if review content matches the business type
- Checks for generic vs. specific details
- Identifies location-specific references

#### c. Comment Length Pattern (0-100)
- Examines the distribution of review lengths
- Identifies unusual patterns in content structure
- Detects copy-pasted content

#### d. Posting Time Consistency (0-100)
- Analyzes the temporal distribution of reviews
- Identifies suspicious posting patterns
- Detects batch posting behavior

#### e. User History Credibility (0-100)
- Evaluates reviewer profiles
- Considers Local Guide status
- Analyzes review and photo contribution history

### 3. Suspicion Score Calculation

The final suspicion score (0-100) is calculated using a weighted average of the five dimensions:
- Higher scores indicate higher likelihood of fake reviews
- Scores above 70 suggest significant suspicious activity
- Scores below 30 generally indicate authentic review patterns

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API Routes
- **AI Model**: OpenAI GPT-4o-mini
- **Web Scraping**: Puppeteer
- **Deployment**: Vercel

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Limitations

- Google Maps rate limiting may affect scraping performance
- Analysis accuracy depends on available review data
- Maximum review analysis limited to recent 50 reviews
- API response times may vary based on review volume

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-4o-mini API
- Vercel for hosting and deployment
- Next.js team for the amazing framework

## Contact

For any questions or feedback, please open an issue in the GitHub repository.