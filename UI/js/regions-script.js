function getRegion() {
  // Extract the region from the URL query parameters
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('regionID');
}

function checkUserSignIn() {
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');
  return accessToken !== null && refreshToken !== null;
}

async function getAllRegion() {
  try {
    const response = await fetch('/api/regions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    // console.log('Data from server:', data);
    const transformedData = data.regions.map(({ regionID, regionName }) => ({ regionID, regionName }));
    return transformedData;
    //return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Rethrow the error to be handled elsewhere if needed
  }
}

async function getPlanDetails(regionId) {
  // try {
  //   const response = await fetch('/api/memberships?regionID=' + regionId, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  try {
    const response = await fetch('/api/regions' , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const filteredData = data.regions.filter(region => region.regionID === regionId);
    console.log(filteredData)
    return filteredData;
    // console.log('Data from server:', data);
    //return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Rethrow the error to be handled elsewhere if needed
  }
}

async function setPrices(regionID) {
  try {
    // Define default prices
    // let platinumPrice = 150;
    // let goldPrice = 100;
    // let silverPrice = 75;
    // let guestPrice = 0;
    //let regionID = 'R123456';

    // Adjust prices based on the selected region
    const data = await getPlanDetails(regionID);
    //console.log(data);

    //console.log(data.data);
    //console.log(data);
    //console.log(data.data[0].platinumPrice);

    // platinumPrice = data.data[0].platinumPrice;
    // goldPrice = data.data[0].goldPrice;
    // silverPrice = data.data[0].silverprice;

    platinumPrice = data[0].platinumPrice;
    goldPrice = data[0].goldPrice;
    silverPrice = data[0].silverprice;
    
    //console.log(platinumPrice);
    //console.log(goldPrice);
    //console.log(silverPrice);
    // Set prices in the HTML
    document.getElementById('platinum-price').innerText = `Price: $${platinumPrice}/month`;
    document.getElementById('gold-price').innerText = `Price: $${goldPrice}/month`;
    document.getElementById('silver-price').innerText = `Price: $${silverPrice}/month`;
    // document.getElementById('guest-price').innerText = `Price: $${guestPrice}/day`;
  } catch (error) {
    console.error('Error setting prices:', error);
    // Handle the error as needed
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  const region = getRegion();
  setPrices(region);
});

async function displayRegions() {
  try {
    const regionsData = await getAllRegion();
  //   const regionsData = [
  //     {
  //         "regionID": "R123456",
  //         "regionName": "College Avenue"
  //     },
  //     {
  //         "regionID": "R1234567",
  //         "regionName": "Busch"
  //     },
  //     {
  //         "regionID": "R12345678",
  //         "regionName": "Livingston"
  //     },
  //     {
  //         "regionID": "R123456789",
  //         "regionName": "Cook Douglass"
  //     }
  // ]

    console.log(regionsData)
    const regionContainer = document.querySelector('.container1');
    regionsData.forEach(region => {
      const regionCard = document.createElement('a');
      regionCard.href = `Regionplans.html?regionID=${region.regionID}`;
      regionCard.className = 'region-card';

      const title = document.createElement('h3');
      title.textContent = region.regionName;

      const image = document.createElement('img');
      // Assuming you have an image URL in your region data
      image.src = `../assets/images/${region.regionID}.jpg`;
      image.alt = `${region.regionName} Image`;

      // const location = document.createElement('p');
      // location.textContent = region.location;

      regionCard.appendChild(title);
      regionCard.appendChild(image);
      //regionCard.appendChild(location);

      regionContainer.appendChild(regionCard);
    });
  } catch (error) {
    console.error('Error displaying regions:', error);
    // Handle the error as needed
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  displayRegions();
});

function purchasePlan(plan) {
  // Add logic to handle the purchase of the selected plan
  // You can redirect to a payment page or implement further actions
  let isUserSignedIn = checkUserSignIn();
  if (isUserSignedIn) {
    console.log('Data:', data); // Log the data
    window.location.replace('payment.html');
  } else {
    // Redirect to the login page
    window.location.href = '/login';
  }
  //alert(`${plan} Plan purchased successfully!`);
}
