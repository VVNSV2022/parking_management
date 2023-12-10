let userID;
let accessToken;
let hourlyRate;
let dailyRate;

accessToken = localStorage.getItem('accessToken');
document.addEventListener('DOMContentLoaded', async () => {
  try {
    userID = localStorage.getItem('userID');
    accessToken = localStorage.getItem('accessToken');
    document.getElementById('region-dropdown').addEventListener('change', populateParkingLotDropdown);
    document.getElementById('region-dropdown').addEventListener('change', populateVehicleDropdown);
  } catch (error) {
    console.error('Error:', error.message);
  }
});

async function populateParkingLotDropdown() {
  try {
    const selectedRegion = document.getElementById('region-dropdown').value;
    const response = await fetch(`/api/region?regionId=${selectedRegion}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    console.log('Api', result);
    if (result.success && result.parkingLots.length > 0) {
      const parkingLotDropdown = document.getElementById('parking-lot-id-dropdown');
      parkingLotDropdown.innerHTML = '';

      //Here I am Populating the parking lot dropdown with the fetched data
      result.parkingLots.forEach((parkingLot) => {
        const option = document.createElement('option');
        option.value = parkingLot.parkingLotID;
        option.text = parkingLot.parkingLotName;
        parkingLotDropdown.add(option);
        console.log(parkingLot);
      });

      console.log(parkingLotDropdown);

      hourlyRate = result.parkingLots[0]['hourlyRate'];
      dailyRate = result.parkingLots[0]['dailyRate']
      console.log(result);
      console.log(result.parkingLots[0]['hourlyRate'])
      console.log(dailyRate)
    } else {
      console.error('No data found for the specified region');
    }
  } catch (error) {
    console.error('Error occurred while fetching parking lots: ', error.message);
  }
}

async function populateVehicleDropdown() { // Here I am populating the vehicle data
  try {
    const response = await fetch(`/api/vehicles?userID=${userID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success && result.data.length > 0) {
      const vehicleDropdown = document.getElementById('vehicle-id');
      vehicleDropdown.innerHTML = '';

      result.data.forEach((vehicle) => {
        const option = document.createElement('option');
        option.value = vehicle.vehicleID;
        option.text = vehicle.licensePlateNumber; // Using the license plate number as the display text
        vehicleDropdown.add(option);
      });
    } else {
      console.error('No vehicles found');
    }
  } catch (error) {
    console.error('Error occurred while fetching vehicles: ', error.message);
  }
}

async function checkMembershipStatus() {
  try {
    const response = await fetch(`/api/user/memberships?userID=${userID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (result.success && result.data && result.data.length > 0) {
      const membershipType = result.data[0].membershipType;
      if (membershipType) {
        return true; 
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error occurred while checking membership status: ', error.message);
    return false;
  }
}

async function saveFormData() {
  const startTime = new Date(document.getElementById('start-time').value).getTime();
  const endTime = new Date(document.getElementById('end-time').value).getTime();
  const parkingLotID = document.getElementById('parking-lot-id-dropdown').value;
  const permitType = document.getElementById('permit-type').value;
  const vehicleID = document.getElementById('vehicle-id').value;

  const timeDifferenceInHours = (endTime - startTime) / (1000 * 60 * 60);

  let cost;
  const isSubscribedMember = await checkMembershipStatus();
  if (isSubscribedMember) {
    cost = 'Subscribed Member'; 
  } else {
    if (permitType === 'hourly') {
      cost = Math.abs(timeDifferenceInHours * hourlyRate);
    } else if (permitType === 'daily') {
      const timeDifferenceInDays = timeDifferenceInHours / 24;
      cost = Math.abs(timeDifferenceInDays * dailyRate);
    } else {
      console.error('Unsupported permit type');
      return;
    }
  }
  console.log('Time Difference (hours):', timeDifferenceInHours);
  console.log('Cost:', cost);

  localStorage.setItem('reservationData', JSON.stringify({
    startTime,
    endTime,
    parkingLotID,
    permitType,
    vehicleID,
    cost,
  }));
}