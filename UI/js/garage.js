
  const garageData = [
    { id: 1, floors: 2, rowsPerFloor: 2, slotsPerRow: 25 },
    { id: 2, floors: 2, rowsPerFloor: 5, slotsPerRow: 10 }
  ];
  
  function generateGarageLayout(floors, rowsPerFloor, slotsPerRow) {
    let html = '';
    let slots_c = 1
  
    for (let floor = 1; floor <= floors; floor++) {
      html += `<h3>Floor ${floor}</h3>`;
  
      for (let row = 1; row <= rowsPerFloor; row++) {
        html += `<div class="garage-row">`;
  
        for (let slot = 1; slot <= slotsPerRow; slot++) {
          let slotClass = 'garage-slot normal';
  
          let slotIndex = (row - 1) * slotsPerRow + slot;
          let totalSlots = rowsPerFloor * slotsPerRow;
  
          if (slotIndex > totalSlots - 10) {
            slotClass = 'garage-slot disabled';
          }
  
          html += `<div class="${slotClass}"> ${slots_c}</div>`;
          slots_c++;
        }
  
        html += `</div>`;
      }
    }
  
    return html;
  }

  
  function displayGarage(id) {
    const selectedGarage = garageData.find(garage => garage.id === id);
    if (selectedGarage) {
      const garageContainer = document.getElementById('garagesContainer');
      garageContainer.innerHTML = '';
  
      const garageDiv = document.createElement('div');
      garageDiv.classList.add('garage-layout');
      garageDiv.innerHTML = `<h2>Garage Layout #${id}</h2>`;
      garageDiv.innerHTML += generateGarageLayout(selectedGarage.floors, selectedGarage.rowsPerFloor, selectedGarage.slotsPerRow);
  
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => {
        editGarageLayout(selectedGarage.id, selectedGarage.floors, selectedGarage.rowsPerFloor, selectedGarage.slotsPerRow);
      });
      garageDiv.appendChild(editButton);
  
      garageContainer.appendChild(garageDiv);
  
      // Change URL without reloading the page
      const newURL = window.location.origin + window.location.pathname + `#layout-${id}`;
      history.pushState(null, null, newURL);
    }
  }
  

  
  
  
  function editGarageLayout(layoutType, currentFloors, currentRowsPerFloor, currentSlotsPerRow) {
    const newFloors = prompt(`Enter new number of floors for Garage Layout ${layoutType}:`, currentFloors);
    const newRowsPerFloor = prompt(`Enter new number of rows per floor for Garage Layout ${layoutType}:`, currentRowsPerFloor);
    const newSlotsPerRow = prompt(`Enter new number of slots per row for Garage Layout ${layoutType}:`, currentSlotsPerRow);
  
    if (newFloors !== null && newRowsPerFloor !== null && newSlotsPerRow !== null) {
      const validatedFloors = parseInt(newFloors);
      const validatedRowsPerFloor = parseInt(newRowsPerFloor);
      const validatedSlotsPerRow = parseInt(newSlotsPerRow);
  
      if (!isNaN(validatedFloors) && !isNaN(validatedRowsPerFloor) && !isNaN(validatedSlotsPerRow) &&
        validatedFloors > 0 && validatedRowsPerFloor > 0 && validatedSlotsPerRow > 0) {
  
        const updatedGarage = {
          id: layoutType,
          floors: validatedFloors,
          rowsPerFloor: validatedRowsPerFloor,
          slotsPerRow: validatedSlotsPerRow
        };
  
        const index = garageData.findIndex(garage => garage.id === layoutType);
        if (index !== -1) {
          garageData.splice(index, 1, updatedGarage);
        }
  
        displayGarage(layoutType);
      } else {
        alert('Please enter valid positive integers for all parameters.');
      }
    }
  }
    // Function to handle loading garage layout based on URL hash
    function loadGarageFromHash() {
      const hash = window.location.hash;
      if (hash.startsWith('#layout-')) {
        const id = parseInt(hash.substring(8)); // Extract ID from hash
        displayGarage(id);
      }
    }
    
    // Event listener for page load
    window.addEventListener('load', loadGarageFromHash);
    
    // Event listener for hash change
    window.addEventListener('hashchange', loadGarageFromHash);

  