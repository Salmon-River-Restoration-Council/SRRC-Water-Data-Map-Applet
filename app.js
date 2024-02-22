// Initialize the map with a center point and zoom level
const map = L.map('map').setView([41.25999138216857, -123.20132665850865], 10);

// Add a tile layer to the map using Esri's World Imagery service for satellite images
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

// Initialize a variable to store the current siteCode
let currentSiteCode = null;

// Define a function to check if a CSV file exists for the given siteCode
function checkCsvFileExists(siteCode, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', `SitesToDate/${siteCode}.csv`, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(true); // File exists
      } else {
        callback(false); // File does not exist
      }
    }
  };
  xhr.send();
}

// Modify the addMarkers function to include the file existence check
function addMarkers(data) {
  data.forEach(([siteName, siteCode, longitude, latitude]) => {
    if (latitude && longitude) {
      // Check if the CSV file exists
      checkCsvFileExists(siteCode, (exists) => {
        let markerOptions = {
          color: 'lightblue',
          fillColor: 'blue',
          fillOpacity: 0.5,
          radius: 5
        };

        let popupContent = '';

        if (exists) {
          // File exists, proceed as normal
          popupContent = createPopupContent(siteName, siteCode, []);
          markerOptions.fillColor = 'blue';
        } else {
          // File does not exist, show a message and use a red marker
          popupContent = `No data available for ${siteCode}`;
          markerOptions.color = 'red';
          markerOptions.fillColor = 'red';
        }

        // Create a circle marker on the map at the given latitude and longitude
        const marker = L.circleMarker([latitude, longitude], markerOptions).addTo(map);

        // Add a click event listener to the marker
        marker.on('click', () => {
          if (exists) {
            currentSiteCode = siteCode; // Store the current siteCode
            // Load site data, create popup content, and render the chart
            loadSiteData(siteCode, (chartData, uniqueYears) => {
              popupContent = createPopupContent(siteName, siteCode, uniqueYears);
              marker.bindPopup(popupContent, { minWidth: 500 }).openPopup();
              console.log('Chart Data for Rendering:', chartData); // Debugging line
              renderChart(`chart-container-${siteCode}`, chartData);
              if (uniqueYears.length > 1) { // Only attach listener if more than one year of data
                attachYearSelectListener(siteCode, chartData);
              }
            });
          } else {
            // If the file does not exist, just show the popup with the message
            marker.bindPopup(popupContent, { minWidth: 500 }).openPopup();
          }
        });
      });
    }
  });
}

// Define a function to create the popup content
function createPopupContent(siteName, siteCode, uniqueYears) {
  const currentYear = new Date().getFullYear().toString();

  // Construct the HTML for the popup with a dropdown for year selection and a chart container
  return `
    <div style="width: 490px;">
      <strong>${siteName}</strong>
      <div>
        <label for="yearSelect-${siteCode}">Select Year:</label>
        <select id="yearSelect-${siteCode}" class="year-select">
          ${uniqueYears.map(year => `<option value="${year}"${year === currentYear ? ' selected' : ''}>${year}</option>`).join('')}
        </select>  Download: <a href="SitesToDate/${siteCode}.csv">${siteCode}.csv</a>
      </div>
      <div id="chart-container-${siteCode}" style="height: 300px;"></div>
    </div>
  `;
}

// Define a function to render the chart in a given container with the provided data
function renderChart(containerId, chartData) {
  const chartContainer = L.DomUtil.get(containerId);
  if (chartContainer) {
    chartContainer.innerHTML = ''; // Clear any existing chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    // Create a new Chart instance and render it into the canvas
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Temperature (\u00B0C)',
          data: chartData.data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
}

// Define a function to attach a listener to the year select dropdown
function attachYearSelectListener(siteCode, chartData) {
  const yearSelectElement = L.DomUtil.get(`yearSelect-${siteCode}`);
  L.DomEvent.on(yearSelectElement, 'change', (e) => {
    const selectedYear = e.target.value;
    const filteredChartData = getChartDataForYear(chartData.allData, selectedYear);
    renderChart(`chart-container-${siteCode}`, filteredChartData);
  });
}

// Define a function to load site data, populate the year select dropdown, and render the chart
function loadSiteData(siteCode, callback) {
  Papa.parse(`SitesToDate/${siteCode}.csv`, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      const uniqueYears = getUniqueYears(results.data);
      const latestYear = uniqueYears[0]; // Get the latest year from the dataset
      const chartData = {
        allData: results.data,
        ...getChartDataForYear(results.data, latestYear) // Load chart data for the latest year
      };
      callback(chartData, uniqueYears);
    }
  });
}

// Define a function to get chart data for a specific year
function getChartDataForYear(data, selectedYear) {
  selectedYear = selectedYear.toString();
  const filteredData = data.filter(entry => {
    const entryYear = new Date(entry.DateTime).getFullYear().toString();
    return entryYear === selectedYear;
  });

  if (filteredData.length === 0) {
    return { labels: [], data: [] };
  }

  return {
    labels: filteredData.map(entry => entry.DateTime),
    data: filteredData.map(entry => entry.TempC)
  };
}

// Define a function to get unique years from the data
function getUniqueYears(data) {
  const years = data.map(entry => new Date(entry.DateTime).getFullYear());
  return [...new Set(years)].sort((a, b) => b - a);
}

// Parse a CSV file containing site locations and add markers to the map
Papa.parse("Water_Sites_LatLon.csv", {
  download: true,
  header: false,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    addMarkers(results.data);
  }
});