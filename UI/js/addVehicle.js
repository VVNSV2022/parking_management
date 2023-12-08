function displayAddVehicleForm() {
  const contentDiv = document.getElementById('content');
  const addVehicleForm = `
    <form id="addVehicleForm">
      <label for="licensePlateNumber">License Plate Number:</label>
      <input type="text" id="licensePlateNumber" name="licensePlateNumber" required>
      <label for="vehicleMake">Vehicle Make:</label>
      <input type="text" id="vehicleMake" name="vehicleMake" required>
      <label for="vehicleModel">Vehicle Model:</label>
      <input type="text" id="vehicleModel" name="vehicleModel" required>
      <label for="vehicleColor">Vehicle Color:</label>
      <input type="text" id="vehicleColor" name="vehicleColor" required>
      <label for="vehicleYear">Vehicle Year:</label>
      <input type="number" id="vehicleYear" name="vehicleYear" required>
      <label for="VIN">VIN:</label>
      <input type="text" id="VIN" name="VIN" required>
      <label for="ownersName">Owner's Name:</label>
      <input type="text" id="ownersName" name="ownersName" required>
      <label for="isVehicleInsured">Is Vehicle Insured:</label>
      <input type="checkbox" id="isVehicleInsured" name="isVehicleInsured">
      <label for="isRental">Is Rental:</label>
      <input type="text" id="isRental" name="isRental">
      <button type="submit" id="submitVehicle">Submit</button>
    </form>
  `;
  contentDiv.innerHTML = addVehicleForm;

  const addVehicleFormElement = document.getElementById('addVehicleForm');
  addVehicleFormElement.addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
      const userID = localStorage.getItem('userID');
      const vehicleData = {
        userID,
        licensePlateNumber: document.getElementById('licensePlateNumber').value,
        vehicleMake: document.getElementById('vehicleMake').value,
        vehicleModel: document.getElementById('vehicleModel').value,
        vehicleColor: document.getElementById('vehicleColor').value,
        vehicleYear: document.getElementById('vehicleYear').value,
        VIN: document.getElementById('VIN').value,
        ownersName: document.getElementById('ownersName').value,
        isVehicleInsured: document.getElementById('isVehicleInsured').checked,
        isRental: document.getElementById('isRental').value,
      };

      const response = await fetch('/api/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        // Success message or UI update after adding the vehicle
        contentDiv.innerHTML = '<p>Vehicle added successfully!</p>';
      } else {
        contentDiv.innerHTML = '<p>Failed to add vehicle. Please try again later.</p>';
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      contentDiv.innerHTML = '<p>Error adding vehicle. Please try again later.</p>';
    }
  });
}
export { displayAddVehicleForm };
