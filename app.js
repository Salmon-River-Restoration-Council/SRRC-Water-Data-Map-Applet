// Initialize the map with a center point and zoom level
var map = L.map('map').setView([41.25999138216857, -123.20132665850865], 10);

// Add a tile layer to the map using Esri's World Imagery service for satellite images
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

// Initialize a variable to store the current siteCode
var currentSiteCode = null;

// Define a function to add circle markers to the map for each data point
function addMarkers(data) {
  data.forEach(function(row) {
    var siteName = row[0];
    var siteCode = row[1];
    var latitude = row[3];
    var longitude = row[2];
    if (latitude && longitude) {
      var marker = L.circleMarker([latitude, longitude], {
        color: 'lightblue',
        fillColor: 'blue',
        fillOpacity: 0.5,
        radius: 5
      }).addTo(map);

      marker.on('click', function() {
        currentSiteCode = siteCode; // Store the current siteCode
        loadSiteData(currentSiteCode, function(chartData, uniqueYears) {
          // Create a popup with a specific id to host the chart and the year dropdown
          var popupContent = `
            <div style="width: 400px;">
              <select id="yearSelect-${siteCode}" class="year-select">
                ${uniqueYears.map(year => `<option value="${year}">${year}</option>`).join('')}
              </select><h2>${siteName}</h2>
              <div id="chart-container-${siteCode}" style="height: 400px;"></div>
            </div>
          `;
          marker.bindPopup(popupContent, { minWidth: 420 }).openPopup();

          // Render the chart inside the popup after the data is loaded
          renderChart(`chart-container-${siteCode}`, chartData);

          // Add change event listener to the year dropdown inside the popup
          var yearSelectElement = L.DomUtil.get(`yearSelect-${siteCode}`);
          L.DomEvent.on(yearSelectElement, 'change', function(e) {
            var selectedYear = e.target.value;
            var filteredChartData = loadChartData(currentSiteCode, chartData.allData, selectedYear);
            renderChart(`chart-container-${siteCode}`, filteredChartData);
          });
        });
      });
    }
  });
}

// Define a function to render the chart in a given container with the provided data
function renderChart(containerId, chartData) {
  var chartContainer = L.DomUtil.get(containerId);
  if (chartContainer) {
    chartContainer.innerHTML = ''; // Clear any existing chart
    var canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: chartData.data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false
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

// Define a function to load site data and populate the year select dropdown
function loadSiteData(siteCode, callback) {
  Papa.parse(`SitesToDate/${siteCode}.csv`, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      var uniqueYears = populateYearSelect(results.data);
      var chartData = {
        allData: results.data,
        ...loadChartData(siteCode, results.data)
      };
      if (typeof callback === 'function') {
        callback(chartData, uniqueYears);
      }
    }
  });
}

// Define a function to load chart data based on the siteCode and filtered by the selected year
function loadChartData(siteCode, data, selectedYear = new Date().getFullYear().toString()) {
  var filteredData = data.filter(function(entry) {
    return new Date(entry.DateTime).getFullYear().toString() === selectedYear;
  });

  var chartData = {
    labels: filteredData.map(function(entry) { return entry.DateTime; }),
    data: filteredData.map(function(entry) { return entry.TempC; })
  };

  return chartData;
}

// Define a function to populate a dropdown with unique years from the data
function populateYearSelect(data) {
  var years = data.map(function(entry) {
    return new Date(entry.DateTime).getFullYear();
  });

  var uniqueYears = Array.from(new Set(years)).sort(function(a, b) { return b - a; });
  return uniqueYears;
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