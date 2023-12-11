const parkingLots = [
    { id: "LOT 32", layoutType: 21 },
    { id: "LOT 12", layoutType: 22 },
    { id: "LOT 67", layoutType: 11 },
    { id: "LOT 53", layoutType: 32 },
    { id: "LOT 46", layoutType: 31 },
    { id: "LOT 13", layoutType: 12 },
    { id: "LOT 24", layoutType: 21 },
    { id: "LOT 29", layoutType: 22 }
    // Add more parking lot details as needed
  ];
  
  window.onload = () => {
    const parkingLotButtons = document.getElementById('parkingLotButtons');
  
    parkingLots.forEach(parkingLot => {
      const button = document.createElement('button');
      button.textContent = parkingLot.id;
      button.addEventListener('click', () => {
        redirectToLayout(parkingLot.layoutType);
      });
      parkingLotButtons.appendChild(button);
    });
  };
  
  function redirectToLayout(layoutType) {
    if (layoutType === 21) {
      window.location.href = 'garage.html#layout-1'; // Redirect to Garage.html with layout 1 selected
    } else if (layoutType === 32) {
      window.location.href = 'elevator.html#elevator-2'; // Redirect to Elevator.html with layout 2 selected
    } else if (layoutType === 11) {
      window.location.href = 'lot.html#lot-1'; // Redirect to Lot.html with layout 11 selected
    } else if (layoutType === 12) {
      window.location.href = 'lot.html#lot-2'; // Redirect to Lot.html with layout 12 selected
    } else if (layoutType === 31) {
      window.location.href = 'elevator.html#elevator-1'; // Redirect to Elevator.html with layout 1 selected
    } else if (layoutType === 22) {
      window.location.href = 'garage.html#layout-2'; // Redirect to Lot.html with layout 22 selected
    } 
    else if (layoutType === 21) {
        window.location.href = 'garage.html#layout-1'; // Redirect to Lot.html with layout 22 selected
      }    
    else {
      // Handle other layout types or provide an error message
      console.log('Layout type not supported');
    }
  }
  