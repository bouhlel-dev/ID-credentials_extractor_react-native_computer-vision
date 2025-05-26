# ID Scanner App

## Overview
This is a mobile application built with Expo and React Native that allows users to scan ID cards using their device's camera. The app extracts information from the scanned images, allows users to review and edit the extracted data, and provides options to save the data locally and export it to Excel.

## Features
- Scan both front and back sides of ID cards
- Extract text information from scanned images
- Review and edit extracted information
- Save scanned ID data to a local database
- View history of previously scanned IDs
- Export data to Excel (.xlsx) format

## Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- A mobile device with the Expo Go app or an emulator

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

5. Scan the QR code with the Expo Go app on your mobile device or run on an emulator

## Google Cloud Vision API Setup

To use the text extraction feature with Google Cloud Vision API:

1. Create a Google Cloud account if you don't have one
2. Create a new project in the Google Cloud Console
3. Enable the Cloud Vision API for your project
4. Create API credentials (API key)