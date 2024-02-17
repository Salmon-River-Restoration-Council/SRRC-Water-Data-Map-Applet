// Initialize the map
var map = L.map('map').setView([41.25999138216857, -123.20132665850865], 10);

// Use Esri.WorldImagery tile layer for satellite images
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

// Initialize the chart
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

// Function to add markers to the map
function addMarkers(data) {
  data.forEach(function(row, i) {
    var [siteCode, latitude, longitude] = row;
    if (latitude && longitude) {
      var marker = L.circleMarker([latitude, longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 5
      }).addTo(map);

      marker.bindPopup(siteCode);
      marker.on('click', function(e) {
        updateChart(e.target.getPopup().getContent());
      });
    } else {
      console.error('Undefined latitude or longitude at row index:', i, 'Row data:', row);
    }
  });
}

// Function to update the chart with data from the CSV file
function updateChart(siteCode) {
  Papa.parse(`SitesToDate/${siteCode}.csv`, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      populateYearSelect(results.data, siteCode);
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

// Function to populate the year select dropdown and set the default year
function populateYearSelect(data, siteCode) {
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

  yearSelect.value = uniqueYears[0];
  updateChart(siteCode);
}

// Event listener for year selection change
document.getElementById('yearSelect').addEventListener('change', function() {
  var siteCode = myChart.data.datasets[0].label;
  if (siteCode) {
    updateChart(siteCode);
  }
});

// Read the CSV file and parse it
Papa.parse("Water_Sites_LatLon.csv", {
  download: true,
  header: false,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    addMarkers(results.data);
  }
});