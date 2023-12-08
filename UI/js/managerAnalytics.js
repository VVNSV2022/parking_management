
function updateTimeRange() {
    var startTimeInput = document.getElementById('startdate');
    var endTimeInput = document.getElementById('enddate');
    var now = new Date();  // Current date and time

    // Default values (current date and time)
    var startDateTime = now.toISOString().slice(0, 16);
    var endDateTime = now.toISOString().slice(0, 16);

    // Update start and end times based on the selected radio button
    var selectedRange = document.querySelector('input[name="timeRange"]:checked').value;
    if (selectedRange === 'lastWeek') {
        var lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        startDateTime = lastWeek.toISOString().slice(0, 16);
    } else if (selectedRange === 'lastMonth') {
        var lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        startDateTime = lastMonth.toISOString().slice(0, 16);
    }

    // Update the input values
    startTimeInput.value = startDateTime;
    endTimeInput.value = endDateTime;
}

document.addEventListener('DOMContentLoaded', function () {

    // logic for checking if the user is signed in
    let isUserSignedIn = true;
    // const user = localStorage.getItem('user');
    // if(user){
    //     isUserSignedIn = true;
    // }
    // else{
    //     window.location.href = '/screens/login.html';
    // }
  
    // Sample data
    const data = {
      "region": {
          "regionId": "R1234567"
      },
      "parkingLots": [
          {
              "parkingLotName": "LOT 12",
              "regionID": "R1234567"
          },
          {
              "parkingLotName": "LOT 13",
              "regionID": "R1234567"
          }
      ]
  };
  
    // Sample region data
    const regiondata = [
      {
          "regionID": "R123456",
          "regionName": "College Avenue"
      },
      {
          "regionID": "R1234567",
          "regionName": "Busch"
      },
      {
          "regionID": "R12345678",
          "regionName": "Livingston"
      }
    ];

    // Function to populate the region dropdown
    function populateRegionDropdown() {
      const regionDropdown = document.getElementById('regionDropdown');
      regionDropdown.innerHTML = '<option value="" disabled selected>Select Region</option>';
      fetch('/api/regions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => response.json())
        .then(data => {
          console.log(data);
          let regions = data.regions;
          if(data.success == true || data.error == false){
        localStorage.setItem('regions', JSON.stringify(regions));
          regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.regionID;
            option.text = region.regionName;
            regionDropdown.appendChild(option);
          });
        }
        });

    //   regiondata.forEach(region => {
    //     const option = document.createElement('option');
    //     option.value = region.regionID;
    //     option.text = region.regionName;
    //     regionDropdown.appendChild(option);
    //   });
  
      checkDropdowns();
    }
  
    // Function to populate the parking lot dropdown based on the selected region
    function populateParkingLotDropdown(selectedRegion) {
      const parkingLotDropdown = document.getElementById('parkingLotDropdown');
      parkingLotDropdown.innerHTML = '<option value="" disabled selected>Select Parking Lot</option>';

      if (selectedRegion) {
        fetch('/api/region?regionId='+selectedRegion, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(response => response.json())
            .then(data => {
              console.log(data);
              let parkingLots = data.parkingLots;
              if(data.success == true || data.error == false){
            localStorage.setItem('parkingLots', JSON.stringify(parkingLots));
              parkingLots.forEach(parkingLot => {
                const option = document.createElement('option');
                option.value = parkingLot.parkingLotID;
                option.text = parkingLot.parkingLotName;
                parkingLotDropdown.appendChild(option);
              });
            }
            });
        // const parkingLots = data.parkingLots.filter(lot => lot.regionID === selectedRegion);
  
        // parkingLots.forEach(parkingLot => {
        //   const option = document.createElement('option');
        //   option.value = parkingLot.parkingLotID;
        //   option.text = parkingLot.parkingLotName;
        //   parkingLotDropdown.appendChild(option);
        // });
  
        parkingLotDropdown.removeAttribute('disabled');
      } else {
        parkingLotDropdown.setAttribute('disabled', 'disabled');
      }
    }
  
    // Function to check if both dropdowns have selected values
    function checkDropdowns() {
      const regionDropdown = document.getElementById('regionDropdown');
      const parkingLotDropdown = document.getElementById('parkingLotDropdown');
      const bookNowBtn = document.getElementById('bookNowBtn');
  
      const isRegionSelected = regionDropdown.value !== '';
      const isParkingLotSelected = parkingLotDropdown.value !== '';
  
      bookNowBtn.disabled = !(isRegionSelected && isParkingLotSelected);
  
      // Display a message when hovering over the button
      if (!isRegionSelected || !isParkingLotSelected) {
        bookNowBtn.title = 'Select both region and parking layout to make a booking';
      } else {
        bookNowBtn.title = '';
      }
    }
  
    // Event listener for region dropdown change
    const regionDropdown = document.getElementById('regionDropdown');
    regionDropdown.addEventListener('change', () => {
      const selectedRegion = regionDropdown.value;
      populateParkingLotDropdown(selectedRegion);
      checkDropdowns();
    });
  
    // Event listener for parking lot dropdown change
    const parkingLotDropdown = document.getElementById('parkingLotDropdown');
    parkingLotDropdown.addEventListener('change', () => {
      checkDropdowns();
    });
  
    // Event listener for book now button
    const bookNowBtn = document.getElementById('bookNowBtn');
    bookNowBtn.addEventListener('click', () => {
      const selectedRegion = regionDropdown.value;
      const selectedParkingLotId = parkingLotDropdown.value;
      const startTime = document.getElementById('startdate').value;
    const endTime = document.getElementById('enddate').value;
  
      if (isUserSignedIn) {
        let accessToken = localStorage.getItem('accessToken');
        console.log(selectedRegion, selectedParkingLotId, startTime, endTime)
        fetch('/api/admin/get-parking-stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`, 
            },
            body: JSON.stringify({
              parkingLotID: selectedParkingLotId,
              fromDate: startTime,
              toDate: endTime
            })
          }).then(response => response.json())
            .then(data => {
              console.log(data);
              if(data.success == true || data.error == false){
                localStorage.setItem('analytics', JSON.stringify(data));
                console.log(window.barChart)
              if(window.barChart){
                console.log('destroying chart')
                  window.barChart.destroy();
              }
                var ctx = document.getElementById('myBarChart').getContext('2d');
                var barplotdata = {
                  labels: Object.keys(data.data),
                  datasets: [{
                      label: 'Percentage',
                      data: Object.values(data.data),
                      backgroundColor: [
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(255, 205, 86, 0.2)',
                          'rgba(54, 162, 235, 0.2)'
                      ],
                      borderColor: [
                          'rgba(75, 192, 192, 1)',
                          'rgba(255, 99, 132, 1)',
                          'rgba(255, 205, 86, 1)',
                          'rgba(54, 162, 235, 1)'
                      ],
                      borderWidth: 1
                  }]
              };
                var barChart = new Chart(ctx, {
                        type: 'bar',
                        data: barplotdata,
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100
                                }
                            }
                        }
                    });
                window.barChart = barChart;

              }
            }).catch(err => {
              console.log(err.message);
            });
      }
    });
    // Initial population of the region dropdown
    populateRegionDropdown();
  });
  