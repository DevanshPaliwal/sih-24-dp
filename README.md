# BIPV Solar Potential Calculator for Ahmedabad City

A project for **Smart India Hackathon 2024**, designed for ISRO to calculate Building-Integrated Photovoltaic (BIPV) solar potential in Ahmedabad city using a **3D model** built with **Three.js** and a frontend powered by **Next.js**.

## Features

- **Dynamic 3D Model Visualization:** Interactive 3D models of Ahmedabad buildings using Three.js.
- **Real-Time Sunlight Simulation:** Accurate sunlight direction and intensity based on latitude, longitude, and time.
- **Solar Potential Calculation:** Estimates energy generation potential using area, solar irradiance, and panel efficiency.
- **User Interaction:** Allows users to select buildings and timeframes to analyze specific solar energy potentials.

## Technologies Used

- **Next.js**: Frontend framework for a seamless React-based application.
- **Three.js**: For 3D visualization and rendering.
- **React Three Fiber**: React bindings for Three.js.
- **TypeScript**: Ensures robust and type-safe code.
- **Other Libraries**: Tailwind CSS for styling, and utility scripts for solar position calculations.

## Setup and Installation

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** 
- **npm** or **yarn**

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:3000`.

## Project Structure

- **`BIPVCalculator.tsx`**: Manages the overall layout, user inputs, and solar potential calculation logic.
- **`SunLight.tsx`**: Simulates sunlight for accurate shading and irradiance analysis.
- **`ThreeJSComponents.tsx`**: Integrates key 3D elements like the city model, sunlight, and user camera controls.

## Key Functionalities

### 1. Solar Potential Calculation
- Uses building geometry (roof and wall areas) and solar irradiance data to calculate potential energy output.

### 2. Sunlight Simulation
- Computes real-time sun positions based on user-selected time and geographical coordinates.

### 3. 3D Navigation
- Allows users to explore the city model, select buildings, and view results dynamically.

## Usage

1. Navigate to the app.
2. Select a building from the interactive 3D scene.
3. Choose a time for solar potential analysis.
4. Click **"Calculate Solar Potential"** to view energy output.
