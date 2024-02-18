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
  data.forEach(function(row, i) {
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

      marker.on('click', function(e) {
        currentSiteCode = siteCode; // Store the current siteCode
        loadSiteData(currentSiteCode, function(chartData) {
          // Create a popup with a specific id to host the chart
          var popupContent = `<div id="chart-container-${siteCode}" style="width: 200px; height: 200px;"></div><select id="yearSelect"></select>`;
          marker.bindPopup(popupContent).openPopup();

          // Render the chart inside the popup after the data is loaded
          var chartContainer = L.DomUtil.get(`chart-container-${siteCode}`);
          if (chartContainer) {
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
                scales: {
                  y: {
                    beginAtZero: false
                  }
                }
              }
            });
          }
        });
      });
    } else {
      console.error('Undefined latitude or longitude at row index:', i, 'Row data:', row);
    }
  });
}

// Define a function to load site data and populate the year select dropdown
function loadSiteData(siteCode, callback) {
  Papa.parse(`SitesToDate/${siteCode}.csv`, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      populateYearSelect(results.data);
      var chartData = loadChartData(siteCode, results.data);
      if (typeof callback === 'function') {
        callback(chartData);
      }
    }
  });
}

// Define a function to load chart data based on the siteCode and filtered by the selected year
function loadChartData(siteCode, data) {
  var selectedYear = document.getElementById('yearSelect').value;
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
  var yearSelect = document.getElementById('yearSelect');
  var previouslySelectedYear = yearSelect.value; // Store the previously selected year
  yearSelect.innerHTML = '';

  uniqueYears.forEach(function(year) {
    var option = document.createElement('option');
    option.value = year;
    option.text = year;
    yearSelect.appendChild(option);
  });

  // Set the year select value to the previously selected year if it's available
  if (uniqueYears.includes(parseInt(previouslySelectedYear))) {
    yearSelect.value = previouslySelectedYear;
  } else if (uniqueYears.length > 0) {
    yearSelect.value = uniqueYears[0];
  }
}

// Add an event listener to the year selection dropdown to update the chart when the year changes
document.getElementById('yearSelect').addEventListener('change', function() {
  if (currentSiteCode) { // Use the stored currentSiteCode
    loadSiteData(currentSiteCode);
  }
});

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