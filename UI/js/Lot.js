// Simulated data for demonstration - Parking Lots
const parkingLotsData = [
  { id: 1, layoutType: 1 },
  { id: 2, layoutType: 2 },
  { id: 3, layoutType: 1 },
  { id: 4, layoutType: 2 }
  // Add more parking lots data as needed
];

function generateParkingLayout(layoutType, rows, cols) {
  rows = rows || (layoutType === 1 ? 10 : 5);
  cols = cols || (layoutType === 1 ? 10 : 20);

  let html = '';
  let totalSlots = rows * cols;

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      let slotClass = '';
      if (totalSlots <= 20) {
        slotClass = 'disabled';
      } else {
        slotClass = 'normal';
      }
      html += `<div class="parking-slot ${slotClass}">LOT ${((i - 1) * cols) + j}</div>`;
      totalSlots--;
    }
    html += '<br>';
  }

  return html;
}

function displayParkingLayout(layoutType, rows, cols) {
  rows = rows || (layoutType === 1 ? 10 : 5);
  cols = cols || (layoutType === 1 ? 10 : 20);

  let html = '';
  let totalSlots = rows * cols;
  let slotNumber = 1;

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      let slotClass = '';
      if (totalSlots <= 20) {
        slotClass = 'disabled';
      } else {
        slotClass = 'normal';
      }
      html += `<div class="parking-slot ${slotClass}"> ${((i - 1) * cols) + j}</div>`;
      slotNumber++;
      totalSlots--;
    }
    html += '<br>';
  }

  const parkingLayout = document.getElementById('parkingLayout');
  parkingLayout.innerHTML = `<h3>Parking Lot Layout ${layoutType}</h3>`;
  parkingLayout.innerHTML += html;

  // Add an edit button after displaying the layout
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.classList.add('button-edit'); // Add the class 'button-edit' for styling
  editButton.addEventListener('click', () => {
    editLayout(layoutType);
  });

  parkingLayout.appendChild(editButton);

  // Change URL hash without reloading the page
  const newURL = window.location.origin + window.location.pathname + `#lot-${layoutType}`;
  history.pushState(null, null, newURL);
}

// Function to edit rows and cols for a layout
function editLayout(layoutType) {
  const rows = window.prompt(`Enter new number of rows for Layout ${layoutType}:`);
  const cols = window.prompt(`Enter new number of columns for Layout ${layoutType}:`);

  if (rows !== null && cols !== null) {
    const validatedRows = parseInt(rows);
    const validatedCols = parseInt(cols);

    if (!isNaN(validatedRows) && !isNaN(validatedCols) && validatedRows > 0 && validatedCols > 0) {
      // Update layout and display the modified layout
      displayParkingLayout(layoutType, validatedRows, validatedCols);
    } else {
      alert('Please enter valid positive integers for rows and columns.');
    }
  }
}


function loadParkingFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#lot-')) {
    const layoutType = parseInt(hash.substring(5)); // Extract layout type from hash
    const selectedLot = parkingLotsData.find(parkingLot => parkingLot.layoutType === layoutType);
    if (selectedLot) {
      displayParkingLayout(selectedLot.layoutType);
    }
  }
}

// Event listener for page load
window.addEventListener('load', loadParkingFromHash);

// Event listener for hash change
window.addEventListener('hashchange', loadParkingFromHash);