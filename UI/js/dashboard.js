//chart data
// Function to convert object to array
function convertObjectToArray(obj) {
    return Object.entries(obj).map(([name, score]) => ({ name, score }));
}

// Function to create and add elements to the 'select' div
// Function to create and add elements to the 'select' div
// function addElementsToSelectDiv() {
//     // Get the 'select' div
//     var selectDiv = document.getElementById('form');

//     // 0. Create labels for elements
//     var parkingLotLabel = document.createElement('label');
//     parkingLotLabel.innerText = 'Parking Lot';

//     var fromDateLabel = document.createElement('label');
//     fromDateLabel.innerText = 'From Date';

//     var toDateLabel = document.createElement('label');
//     toDateLabel.innerText = 'To Date';

//     // 1. Create a list of parking lots
//     var parkingLotList = document.createElement('select');
//     parkingLotList.setAttribute('name', 'parkingLot');

//     // Fetch parking lots data from the API
//     fetch('/api/allparkinglots')
//         .then(response => response.json())
//         .then(parkingLots => {
//             // Add options to the select element based on the fetched data
//             parkingLots.forEach(parkingLot => {
//                 var option = document.createElement('option');
//                 option.value = parkingLot.id;  // Assuming 'id' is the property representing the parking lot ID
//                 option.text = parkingLot.name;  // Assuming 'name' is the property representing the parking lot name
//                 parkingLotList.appendChild(option);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching parking lots:', error.message);
//         });

//     // 2. Create an input element for the 'from' date
//     var fromDateInput = document.createElement('input');
//     fromDateInput.setAttribute('type', 'date');
//     fromDateInput.setAttribute('name', 'from');

//     // 3. Create an input element for the 'to' date
//     var toDateInput = document.createElement('input');
//     toDateInput.setAttribute('type', 'date');
//     toDateInput.setAttribute('name', 'to');

//     // Add the created labels and elements to the 'select' div
//     selectDiv.appendChild(parkingLotLabel);
//     selectDiv.appendChild(parkingLotList);

//     selectDiv.appendChild(fromDateLabel);
//     selectDiv.appendChild(fromDateInput);

//     selectDiv.appendChild(toDateLabel);
//     selectDiv.appendChild(toDateInput);
// }

// // Call the function to add elements when the page loads
// addElementsToSelectDiv();





// // Assuming you have a function to make the fetch request
// async function fetchData() {
//     const parkingLotID = 'p55555';  // Replace with your actual value
//     const toTime = 1642377599000;    // Replace with your actual value
//     const fromTime = 1606645200000;  // Replace with your actual value

//     const url = `/api/admin/dashboard?parkingLotID=${parkingLotID}&toTime=${toTime}&fromTime=${fromTime}`;

//     try {
//         const response = await fetch(url);
//         const data = await response.json();

//         // Check if the response is successful
//         if (data.success) {
//             // Convert the received data to the desired format
//             const convertedData = convertObjectToArray(data.data);

//             // Process the converted data and create a chart
//             createChart(convertedData);
//         } else {
//             console.error('Error fetching data:', data.message);
//         }
//     } catch (error) {
//         console.error('Error fetching data:', error.message);
//     }
// }

// Function to create and add elements to the 'select' div
function addElementsToSelectDiv() {
    // Get the 'select' div
    var selectDiv = document.getElementById('select');

    // 0. Create labels for elements
    var parkingLotLabel = document.createElement('label');
    parkingLotLabel.innerText = 'Parking Lot';

    var fromDateLabel = document.createElement('label');
    fromDateLabel.innerText = 'From Date';

    var toDateLabel = document.createElement('label');
    toDateLabel.innerText = 'To Date';

    // 1. Create a list of parking lots
    var parkingLotList = document.createElement('select');
    parkingLotList.setAttribute('name', 'parkingLot');

    // Fetch parking lots data from the API
    fetch('/api/allParkingLots')
        .then(response => response.json())
        .then(parkingLots => {
            // Add options to the select element based on the fetched data
            console.log(parkingLots.data);
            parkingLots.data.forEach(parkingLot => {
                var option = document.createElement('option');
                option.value = parkingLot.parkingLotID;  // Assuming 'id' is the property representing the parking lot ID
                option.text = parkingLot.parkingLotName;  // Assuming 'name' is the property representing the parking lot name
                parkingLotList.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching parking lots:', error.message);
        });

    // 2. Create an input element for the 'from' date
    var fromDateInput = document.createElement('input');
    fromDateInput.setAttribute('type', 'date');
    fromDateInput.setAttribute('name', 'from');

    // 3. Create an input element for the 'to' date
    var toDateInput = document.createElement('input');
    toDateInput.setAttribute('type', 'date');
    toDateInput.setAttribute('name', 'to');

    // 4. Create a button to trigger data fetching
    var fetchDataButton = document.createElement('button');
    fetchDataButton.innerText = 'Fetch Data';
    fetchDataButton.addEventListener('click', function () {
        // Call the fetchData function with selected dates and parking lot
        fetchData({
            parkingLotID: parkingLotList.value,
            toTime: new Date(toDateInput.value).getTime(),
            fromTime: new Date(fromDateInput.value).getTime()
        });
    });

    // Add the created labels, elements, and button to the 'select' div
    selectDiv.appendChild(parkingLotLabel);
    selectDiv.appendChild(parkingLotList);

    selectDiv.appendChild(fromDateLabel);
    selectDiv.appendChild(fromDateInput);

    selectDiv.appendChild(toDateLabel);
    selectDiv.appendChild(toDateInput);

    selectDiv.appendChild(fetchDataButton);
}

// Call the function to add elements when the page loads
addElementsToSelectDiv();

// Function to fetch data based on selected dates and parking lot
async function fetchData({ parkingLotID, toTime, fromTime }) {
    toTime = new Date(toTime).getTime();
    fromTime = new Date(fromTime).getTime();
    // console.log(toTimeUTC,fromTimeUTC);
    //  parkingLotID = 'p55555';  // Replace with your actual value
    //  toTime = 1642377599000;    // Replace with your actual value
    //  fromTime = 1606645200000;  // Replace with your actual value

    const url = `/api/admin/dashboard?parkingLotID=${parkingLotID}&toTime=${toTime}&fromTime=${fromTime}`;
      try {
        const response = await fetch(url);
        const data = await response.json();

        // Check if the response is successful
        if (data.success) {
            // Convert the received data to the desired format
            const convertedData = convertObjectToArray(data.data);

            // Process the converted data and create a chart (or do other actions)
            createChart(convertedData);
        } else {
            console.error('Error fetching data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}




function createChart(data) {
    // var chartjson = {
    //     "title": "Statistics",
    //     "ymax": 100,
    //     "ykey": 'score',
    //     "xkey": "name",
    //     "prefix": "%",
    //     "data": data  // Add the converted array as the 'data' property
    // };

    var chartjson ={
        "data": [
          { "name": "overstays", "score": 5 },
          { "name": "occupancies", "score": 40 },
          { "name": "availabilities", "score": 20 },
          { "name": "noShows", "score": 0 }
        ],
        "prefix": "%",
        "title": "Statistics",
        "xkey": "name",
        "ykey": "score",
        "ymax": 100
      }

  console.log(chartjson);
  //chart colors
  var colors = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];
  
  //constants
  var TROW = 'tr',
    TDATA = 'td';
  
  var chart = document.createElement('div');
  
  //create the chart canvas
  var barchart = document.createElement('table');
  //create the title row
  var titlerow = document.createElement(TROW);
  //create the title data
  var titledata = document.createElement(TDATA);
  //make the colspan to number of records
  titledata.setAttribute('colspan', chartjson.data.length + 1);
  titledata.setAttribute('class', 'charttitle');
  titledata.innerText = chartjson.title;
  titlerow.appendChild(titledata);
  barchart.appendChild(titlerow);
  chart.appendChild(barchart);
  
  //create the bar row
  var barrow = document.createElement(TROW);
  
  //lets add data to the chart
  for (var i = 0; i < chartjson.data.length; i++) {
    barrow.setAttribute('class', 'bars');
    var prefix = chartjson.prefix || '';
    //create the bar data
    var bardata = document.createElement(TDATA);
    var bar = document.createElement('div');
    bar.setAttribute('class', colors[i]);
    bar.style.height = chartjson.data[i][chartjson.ykey] + prefix;
    bardata.innerText = chartjson.data[i][chartjson.ykey] + prefix;
    bardata.appendChild(bar);
    barrow.appendChild(bardata);
  }
  
  //create legends
  var legendrow = document.createElement(TROW);
  var legend = document.createElement(TDATA);
  legend.setAttribute('class', 'legend');
  legend.setAttribute('colspan', chartjson.data.length);
  
  //add legend data
  for (var i = 0; i < chartjson.data.length; i++) {
    var legbox = document.createElement('span');
    legbox.setAttribute('class', 'legbox');
    var barname = document.createElement('span');
    barname.setAttribute('class', colors[i] + ' xaxisname');
    var bartext = document.createElement('span');
    bartext.innerText = chartjson.data[i][chartjson.xkey];
    legbox.appendChild(barname);
    legbox.appendChild(bartext);
    legend.appendChild(legbox);
  }
  barrow.appendChild(legend);
  barchart.appendChild(barrow);
  barchart.appendChild(legendrow);
  chart.appendChild(barchart);
  document.getElementById('chart').innerHTML = chart.outerHTML;}

  fetchData();



// Add this at the end of your JavaScript code

// Add event listener to the dynamic pricing link
var dynamicPricingLink = document.getElementById('dynamicPricingLink');
dynamicPricingLink.addEventListener('click', showPricingModel);

// Function to show the pricing model
function showPricingModel(event) {
    event.preventDefault();  // Prevent default link behavior

    // Check if the pricing model overlay already exists
    var existingOverlay = document.getElementById('pricingOverlay');
    if (existingOverlay) {
        return; // Do nothing if the overlay is already present
    }

    // Create the pricing model overlay
    var overlay = document.createElement('div');
    overlay.id = 'pricingOverlay';
    overlay.className = 'overlay';

    // Create the pricing model
    var pricingModel = document.createElement('div');
    pricingModel.id = 'pricingModel';
    pricingModel.className = 'modal';

    pricingModel.innerHTML = `
        <h2>Dynamic Pricing</h2>
        <label for="price">Price:</label>
        <input type="text" id="price" name="price" value=7 style="width: 100%;">

        <label for="overstayPrice">Overstay Price:</label>
        <input type="text" id="overstayPrice" name="overstayPrice" value=4 style="width: 100%;">

        <label for="penalty">Penalty:</label>
        <input type="text" id="penalty" name="penalty" value=10 style="width: 100%;">

        <button id="submitPricing">Submit</button>
    `;

    // Add event listener to the submit button
    var submitButton = pricingModel.querySelector('#submitPricing');
    submitButton.addEventListener('click', updatePricing);

    // Append the pricing model to the overlay
    overlay.appendChild(pricingModel);

    // Append the overlay to the body
    document.body.appendChild(overlay);
}

// Function to update pricing based on user input
function updatePricing() {
    // Get values from the input fields
    var newPrice = document.getElementById('price').value;
    var newOverstayPrice = document.getElementById('overstayPrice').value;
    var newPenalty = document.getElementById('penalty').value;

    // Update pricing (you may need to send these values to the server)
    // Example: fetchData({ newPrice, newOverstayPrice, newPenalty });

    // Close the pricing model by removing the overlay
    var overlay = document.getElementById('pricingOverlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}


