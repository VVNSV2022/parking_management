function displayUpdateForm(userData, userID) {
  const contentDiv = document.getElementById('content');
  // Create the form elements with the existing user data
  const updateForm = `
    <form id="updateForm">
      <label for="phoneNumber">Phone Number:</label>
      <input type="text" id="phoneNumber" name="phoneNumber" value="${userData.phoneNumber}">
      <label for="city">City:</label>
      <input type="text" id="city" name="city" value="${userData.address.city}">
      <label for="street">Street:</label>
      <input type="text" id="street" name="street" value="${userData.address.streetNumber}">
      <label for="state">State:</label>
      <input type="text" id="state" name="state" value="${userData.address.state}">
      <label for="aptUnit">Apt Unit:</label>
      <input type="text" id="aptUnit" name="aptUnit" value="${userData.address.aptUnit}">
      <button type="submit" id="submitUpdate">Submit</button>
    </form>
  `;
  contentDiv.innerHTML = updateForm;

  // Add event listener to handle form submission
  const updateFormElement = document.getElementById('updateForm');
  updateFormElement.addEventListener('submit', async function(event) {
    event.preventDefault();
    try {
      // Collect updated data from the form
      const updatedUserData = {
        phoneNumber: document.getElementById('phoneNumber').value,
        currentAddress:{
            city: document.getElementById('city').value,
            streetNumber: document.getElementById('street').value,
            state:document.getElementById('state').value,
            aptUnit:document.getElementById('aptUnit').value,
        },
        userID: userID
      };

      // Send a PUT request with the updated data to the user endpoint
      const response = await fetch(`/api/customer/${userID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUserData)
      });

      if (response.ok) {
        // On successful update, display a success message or update the UI as needed
        contentDiv.innerHTML = '<p>Profile updated successfully!</p>';
      } else {
        // Handle error response
        contentDiv.innerHTML = '<p>Failed to update profile. Please try again later.</p>';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      contentDiv.innerHTML = '<p>Error updating profile. Please try again later.</p>';
    }
  });
}
export { displayUpdateForm };
