// Function to generate elevator layout based on parameters

const elevatorData = [
  { id: 1, layoutType: 1 },
  { id: 2, layoutType: 2 },
  { id: 3, layoutType: 3 }
  // Add more elevator data as needed
];

function generateElevatorLayout(layoutType, levels, slotsPerLevel) {
  let html = '';
  let slots_c = 1;

  for (let level = 1; level <= levels; level++) {
    html += `<h3>Level ${level}</h3>`;

    for (let slot = 1; slot <= slotsPerLevel; slot++) {
      let slotClass = 'elevator-slot normal';
      let lastDisabledSlots = Math.floor(20 / levels);

      let totalSlots = (level - 1) * slotsPerLevel + slot;

      if (slot > slotsPerLevel - lastDisabledSlots) {
        slotClass = 'elevator-slot disabled';
      }

      html += `<div class="${slotClass}"> ${slots_c}</div>`;
      slots_c++;
    }
  }

  return html;
}

// Function to display elevator layout on click
function displayElevatorLayout(layoutType, levels, slotsPerLevel) {
  const elevatorContainer = document.getElementById('elevatorContainer');
  const elevatorDiv = document.createElement('div');
  elevatorDiv.classList.add('elevator-layout');
  elevatorDiv.setAttribute('id', `elevator_${layoutType}`);

  elevatorDiv.innerHTML = `<h2>Elevator Layout ${layoutType}</h2>`;
  elevatorDiv.innerHTML += generateElevatorLayout(layoutType, levels, slotsPerLevel);

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.classList.add('button-edit');
  editButton.addEventListener('click', () => {
    editElevatorLayout(layoutType, levels, slotsPerLevel);
  });
  elevatorDiv.appendChild(editButton);

  elevatorContainer.innerHTML = '';
  elevatorContainer.appendChild(elevatorDiv);

  // Change URL hash without reloading the page
  const newURL = window.location.origin + window.location.pathname + `#elevator-${layoutType}`;
  history.pushState(null, null, newURL);

  // Redirect to the new URL when the button is clicked
  // editButton.addEventListener('click', () => {
  //   window.location.href = newURL;
  // });
}


// Function to edit elevator layout parameters
function editElevatorLayout(layoutType, currentLevels, currentSlotsPerLevel) {
  const newLevels = prompt(`Enter new number of levels for Elevator Layout ${layoutType}:`, currentLevels);
  const newSlotsPerLevel = prompt(`Enter new number of slots per level for Elevator Layout ${layoutType}:`, currentSlotsPerLevel);

  if (newLevels !== null && newSlotsPerLevel !== null) {
    const validatedLevels = parseInt(newLevels);
    const validatedSlotsPerLevel = parseInt(newSlotsPerLevel);

    if (!isNaN(validatedLevels) && !isNaN(validatedSlotsPerLevel) &&
      validatedLevels > 0 && validatedSlotsPerLevel > 0) {
      displayElevatorLayout(layoutType, validatedLevels, validatedSlotsPerLevel);
    } else {
      alert('Please enter valid positive integers for levels and slots per level.');
    }
  }
}

window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (hash.startsWith('#elevator-')) {
    const layoutType = parseInt(hash.substring(10)); // Extract layout type from the hash
    if (!isNaN(layoutType)) {
      // Perform action based on the hash value
      displayElevatorLayout(layoutType, /* other parameters */);
    }
  }
});


