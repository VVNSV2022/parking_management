// Function to check if the user is signed in
function checkUserSignIn() {
  const accessToken = sessionStorage.getItem('accessToken');
  console.log(accessToken);
  const refreshToken = sessionStorage.getItem('refreshToken');
  console.log(accessToken);
  console.log(accessToken !== null && refreshToken !== null);
  return accessToken !== null && refreshToken !== null;
}

document.addEventListener('DOMContentLoaded', function () {
// Image Gallery Logic
const imageGallery = document.getElementById('imageGallery');
let isUserSignedIn = checkUserSignIn();
let currentImageIndex = 0;
let data = {};

// Function to show the next image
function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % imageGallery.children.length;
  updateImageDisplay();
}

// Function to update the image display
function updateImageDisplay() {
  for (let i = 0; i < imageGallery.children.length; i++) {
    const image = imageGallery.children[i];

    if (i === currentImageIndex) {
      image.style.display = 'block';
      image.addEventListener('click', showNextImage); // Add click event listener
    } else {
      image.style.display = 'none';
      image.removeEventListener('click', showNextImage); // Remove click event listener
    }
  }
}

// Initial image display
updateImageDisplay();

 // Function to populate the region dropdown with all region names
 async function populateRegionDropdown() {
  const regionDropdown = document.getElementById('regionDropdown');
  regionDropdown.innerHTML = '<option value="" disabled selected>Select Region</option>';

  try {
    const response = await fetch('/api/regions');
    const result = await response.json();

    if (response.ok && result.success && result.regions.length > 0) {
      result.regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.regionID;
        option.text = region.regionName;
        regionDropdown.appendChild(option);
      });
    } else {
      console.error('Error fetching regions:', result.message);
    }
  } catch (error) {
    console.error('An error occurred while fetching regions:', error.message);
  }

  checkDropdowns();
}

// Function to populate the parking lot dropdown based on the selected region
async function populateParkingLotDropdown(selectedRegion) {
  const parkingLotDropdown = document.getElementById('parkingLotDropdown');
  parkingLotDropdown.innerHTML = '<option value="" disabled selected>Select Parking Lot</option>';

  try {
    const response = await fetch(`/api/region?regionId=${selectedRegion}`);
    const result = await response.json();

    if (response.ok && result.success && result.parkingLots.length > 0) {
      data.parkingLots = result.parkingLots; // store the data

      result.parkingLots.forEach(parkingLot => {
        const option = document.createElement('option');
        option.value = parkingLot.parkingLotID;
        option.text = parkingLot.parkingLotName;
        parkingLotDropdown.appendChild(option);
      });

      parkingLotDropdown.removeAttribute('disabled');
    } else {
      console.error('Error fetching parking lots:', result.message);
      parkingLotDropdown.setAttribute('disabled', 'disabled');
    }
  } catch (error) {
    console.error('An error occurred while fetching parking lots:', error.message);
    parkingLotDropdown.setAttribute('disabled', 'disabled');
  }

  checkDropdowns();
}

// Function to display parking lot details
function displayParkingLotDetails(parkingLot) {
  const parkingLotDetailsContainer = document.getElementById('parkingLotDetails');
  parkingLotDetailsContainer.innerHTML = '';

  const detailsHeading = document.createElement('h2');
  detailsHeading.textContent = 'Parking Lot Details:';
  parkingLotDetailsContainer.appendChild(detailsHeading);
  parkingLotDetailsContainer.style.textAlign = 'center';
  parkingLotDetailsContainer.style.fontSize = '1em';

  const detailsList = document.createElement('ul');
  detailsList.style.listStyleType = 'none';
  detailsList.innerHTML = `
  <li class='parkingdetailsList'><em>Name:</strong> ${parkingLot.parkingLotName}</em></li>
  <li class='parkingdetailsList'><em>Disabled Parking Spots:</strong> ${parkingLot.disabledParkingSpots}</em></li>
  <li class='parkingdetailsList'><em>Number of Parking Spots:</strong> ${parkingLot.numberOfParkingSpots}</em></li>
  <li class='parkingdetailsList'><em>Rank:</strong> ${parkingLot.parkingLotRank}</em></li>
  <li class='parkingdetailsList'><em>Hourly Rate:</strong> ${parkingLot.hourlyRate}</em></li>
  <li class='parkingdetailsList'><em>Daily Rate:</strong> ${parkingLot.dailyRate}</em></li>
  <li class='parkingdetailsList'><em>Extra Fine:</strong> ${parkingLot.extraFine}</em></li>
  <li class='parkingdetailsList'><em>Overstays:</strong> ${parkingLot.overstays}</em></li>
  <li class='parkingdetailsList'><em>Penalties:</strong> ${parkingLot.penalties}</em></li>
  <!-- Add more details as needed -->
  `;

  parkingLotDetailsContainer.appendChild(detailsList);
  parkingLotDetailsContainer.style.border = '7px double #ccc';
  parkingLotDetailsContainer.style.width = '30%'; // Adjust the width as needed
  parkingLotDetailsContainer.style.margin = '0 auto'; // Center the container horizontally
}

// Function to clear parking lot details
function clearParkingLotDetails() {
  const parkingLotDetailsContainer = document.getElementById('parkingLotDetails');
  parkingLotDetailsContainer.innerHTML = '';
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
  clearParkingLotDetails();
  populateParkingLotDropdown(selectedRegion);
});

// Event listener for parking lot dropdown change
const parkingLotDropdown = document.getElementById('parkingLotDropdown');
parkingLotDropdown.addEventListener('change', () => {
  const selectedParkingLotId = parkingLotDropdown.value;

  // Check if a parking lot is selected
  if (selectedParkingLotId) {
    // Find the selected parking lot details from the stored data
    const selectedParkingLot = data.parkingLots.find(parkingLot => parkingLot.parkingLotID === selectedParkingLotId);

    if (selectedParkingLot) {
      // Display parking lot details
      displayParkingLotDetails(selectedParkingLot);
    } else {
      console.error('Error: Selected parking lot details not found.');
    }
  } else {
    // Clear parking lot details if no parking lot is selected
    clearParkingLotDetails();
  }

  checkDropdowns();
});

// Event listener for book now button
const bookNowBtn = document.getElementById('bookNowBtn');
bookNowBtn.addEventListener('click', () => {
  const selectedRegion = regionDropdown.value;
  const selectedParkingLotId = parkingLotDropdown.value;

  console.log('Selected Region:', selectedRegion);
  console.log('Selected Parking Lot ID:', selectedParkingLotId);

  if (isUserSignedIn) {
    console.log(isUserSignedIn);
    console.log('Data:', data); // Log the data
    window.location.replace('screens/makereservation.html');
  } else {
    // Redirect to the login page
    window.location.href = 'screens/login.html';
    window.location.href = '/login';
  }
});

// Initial population of the region dropdown
populateRegionDropdown();

});
