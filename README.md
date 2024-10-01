# SRRC Water Data Map

This repository contains the code for a web-based app that visualizes water data on an interactive map. The mapplet uses Leaflet.js for mapping, Chart.js for charting, and PapaParse for parsing CSV data.

## DISCLAIMER

This application is intended for internal use by the Salmon River Restoration Council (SRRC). While efforts have been made to ensure its functionality, it is provided "as is" without any warranties, express or implied. Users should exercise caution and use the software at their own risk. The SRRC is not liable for any damages or losses resulting from the use of this software.

## WORK IN PROGRESS

- This application is currently under development and may not be production-ready.
- Features and functionality may change as development progresses.

## Features

- Interactive map with zoom and pan capabilities
- Circle markers representing different water and air monitoring sites
- Clickable markers to display temperature data charts
- Year selection for filtering data on the chart
- Toggle controls for showing/hiding water sites, air sites, and unavailable data

## Prerequisites

Before you can run the mapplet locally, you need to have the following:

- Python (for serving the directory via HTTP server)
- Relevant site data `.csv` files in the `SitesToDate/` directory

## Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/00x29a/SRRC-Water-Data-Map-Applet.git
```

2. Navigate to the cloned repository's directory:

```bash
cd SRRC-Water-Data-Map-Applet
```

## Usage

To view the mapplet in your web browser, you need to serve the directory over HTTP. Use the provided script for your operating system:

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

After running the appropriate script, open your web browser and go to:

```
http://localhost:8000
```

You should now see the SRRC Water Data Mapplet running locally.

## File Structure

- `index.html`: The main HTML file containing the structure of the mapplet.
- `app.js`: The JavaScript file that contains the logic for map interaction and data visualization.
- `styles.css`: CSS file for custom styling of the application.
- `pyserve.bat`: A batch file for serving the directory on Windows.
- `pyserve.sh`: A shell script for serving the directory on Unix-based systems.
- `SitesToDate/`: Directory containing the relevant site data CSV files.
- `Water_Sites_LatLon.csv`: File containing the latitude and longitude information of different sites.

## Libraries Used

- [Leaflet](https://leafletjs.com/) for interactive maps
- [Chart.js](https://www.chartjs.org/) for responsive charts
- [PapaParse](https://www.papaparse.com/) for parsing CSV files
- [Showdown](https://github.com/showdownjs/showdown) for converting Markdown to HTML

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

