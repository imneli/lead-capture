
<div align="center">

# 🔍 Lead Scrapper | Google Maps to Discord

</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=flat&logo=discord&logoColor=white)](https://discord.com)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-19.x-40B5A4?style=flat&logo=puppeteer&logoColor=white)](https://pptr.dev)

*Automate lead collection from Google Maps and send them directly to your Discord server!*


</div>

---


### 📋 Overview
This tool automates the process of scraping business information from Google Maps and sending it directly to Discord through webhooks. Perfect for lead generation and market research.

### ✨ Features
- 🤖 **Automated Google Maps scraping**: Collects business data with ease.
- 📱 **Contact information**: Extracts phone numbers and email addresses.
- ⭐ **Ratings & reviews**: Gathers ratings and the number of reviews.
- 🌐 **Website URLs**: Captures business website links.
- 📍 **Maps locations**: Provides direct links to Google Maps locations.
- 💬 **Discord integration**: Sends collected data directly to your Discord server via webhooks.

### 🚀 Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/imneli/lead-capture.git
   cd lead-capture
   ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    - Create a .env file in the Commands folder and add your Discord webhook URL:

    ```bash
    echo DISCORD_WEBHOOK_URL=your_webhook_url_here > Commands/.env
    ```

4. **Run the Script**

```bash
node index.js
```

### 📁 Project Structure

```bash
Lead_Scrapper/
├── Commands/
│   ├── sendToDiscord.js
│   └── .env
├── index.js
└── results.json
```

### 📄 Results Format

```json
[
  {
    "title": "Business Name",
    "phone": "Phone Number",
    "email": "Email Address",
    "stars": "Rating Score",
    "reviews": "Number of Reviews",
    "website": "Website URL",
    "link": "Google Maps URL"
  }
]
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

    1 - Fork the repository.
    2 - Create a new branch (git checkout -b feature/AmazingFeature).
    3 - Commit your changes (git commit -m 'Add some AmazingFeature').
    4 - Push to the branch (git push origin feature/AmazingFeature).
    5 - Open a pull request.

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details.