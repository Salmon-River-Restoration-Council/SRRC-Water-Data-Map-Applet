// Initialize the map with a center point and zoom level
var map = L.map('map').setView([41.25999138216857, -123.20132665850865], 10);

// Add a tile layer to the map using Esri's World Imagery service for satellite images
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

// Initialize a variable to store the current siteCode
var currentSiteCode = null;

// Get the context of the canvas element for charting and initialize a new Chart.js line chart
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperature (°C)',
      data: [],
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

      marker.bindPopup(siteCode);

      marker.on('click', function(e) {
        currentSiteCode = e.target.getPopup().getContent(); // Store the current siteCode
        // Clear the chart before loading new data
        myChart.data.labels = [];
        myChart.data.datasets.forEach((dataset) => {
          dataset.data = [];
        });
        myChart.update();
        // Load new data
        loadChartData(currentSiteCode);
      });
    } else {
      console.error('Undefined latitude or longitude at row index:', i, 'Row data:', row);
    }
  });
}

// Define a function to load chart data
function loadChartData(siteCode) {
  Papa.parse(`SitesToDate/${siteCode}.csv`, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      var selectedYear = document.getElementById('yearSelect').value;
      var filteredData = results.data.filter(function(entry) {
        return new Date(entry.DateTime).getFullYear().toString() === selectedYear;
      });

      myChart.data.labels = filteredData.map(function(entry) { return entry.DateTime; });
      myChart.data.datasets[0].data = filteredData.map(function(entry) { return entry.TempC; });
      myChart.update();
    }
  });
}

// Define a function to populate a dropdown with unique years from the data
function populateYearSelect(data) {
  var years = data.map(function(entry) {
    return new Date(entry.DateTime).getFullYear();
  });

  var uniqueYears = Array.from(new Set(years)).sort(function(a, b) { return b - a; });
  var yearSelect = document.getElementById('yearSelect');
  yearSelect.innerHTML = '';

  uniqueYears.forEach(function(year) {
    var option = document.createElement('option');
    option.value = year;
    option.text = year;
    yearSelect.appendChild(option);
  });
}

// Add an event listener to the year selection dropdown to update the chart when the year changes
document.getElementById('yearSelect').addEventListener('change', function() {
  if (currentSiteCode) { // Use the stored currentSiteCode
    loadChartData(currentSiteCode);
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
    // Populate the year select with the first site's data as an example
    // You might want to change this to a more appropriate call depending on your app's logic
    if (results.data.length > 0) {
      var firstSiteCode = results.data[0][1];
      Papa.parse(`SitesToDate/${firstSiteCode}.csv`, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          populateYearSelect(results.data);
        }
      });
    }
  }
});