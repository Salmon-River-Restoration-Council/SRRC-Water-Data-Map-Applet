
# SRRC Water Data Mapplet

This repository contains the code for a web-based mapplet that visualizes water data on an interactive map. The mapplet uses Leaflet.js for mapping, Chart.js for charting, and PapaParse for parsing CSV data.

## Features

- Interactive map with zoom and pan capabilities
- Circle markers representing different water sites
- Clickable markers to display temperature data charts
- Year selection for filtering data on the chart

## Prerequisites

Before you can run the mapplet locally, you need to have the following installed:

- Python (for serving the directory via HTTP server)
- Copy relevant site data `.csv` files into the `SitesToDate/` directory

## Installation

Clone the repository to your local machine using the following command:

```bash
git clone https://github.com/00x29a/SRRC-Water-Data-Map-Applet.git
```

Navigate to the cloned repository's directory:

```bash
cd SRRC-Water-Data-Map-Applet
```

## Usage

To view the mapplet in your web browser, you need to serve the directory over HTTP. You can do this using the provided `.bat` file for Windows or `.sh` file for Unix-based systems.

### For Windows

Double-click on the `pyserve.bat` file or run it from the command line:

```cmd
.\pyserve.bat
```

### For Unix-based systems

Make the `pyserve.sh` script executable and run it:

```bash
chmod +x pyserve.sh
./pyserve.sh
```

After running the appropriate script for your operating system, open your web browser and go to:

```
http://localhost:8000
```

You should now see the SRRC Water Data Mapplet running locally.

## File Structure

- `index.html`: The main HTML file containing the structure of the mapplet.
- `app.js`: The JavaScript file that contains the logic for map interaction and data visualization.
- `pyserve.bat`: A batch file for serving the directory on Windows.
- `pyserve.sh`: A shell script for serving the directory on Unix-based systems.
- `SitesToDate/`: Directory containing the relevant site data CSV files.
- `Water_Sites_LatLon.csv`: File containing the latitude and longitude information of different sites.

## Libraries Used

- [Leaflet](https://leafletjs.com/) for interactive maps
- [Chart.js](https://www.chartjs.org/) for responsive charts
- [PapaParse](https://www.papaparse.com/) for parsing CSV files

