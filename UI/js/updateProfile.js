try {
    document.addEventListener('DOMContentLoaded', function () {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async function(event) {
                try {
                    event.preventDefault(); // Prevents the default form submission
                    const contentDiv = document.getElementById('content');
                    const userID = localStorage.getItem('userID');
                    const token = localStorage.getItem('token');
                    
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
                    const response = await fetch(`/api/customer`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          method: 'PUT',
                          body: JSON.stringify(updatedUserData)
                        });

                    if (response.ok) {
                        console.log(response)
                        document.getElementById('result').innerHTML = '<p>Profile updated successfully!</p>';
                    } else {
                        console.log(response)
                        document.getElementById('result').innerHTML = '<p>Failed to update profile. Please try again later.</p>';
                    }
                } catch (error) {
                    console.error('Error within form submission:', error);
                    document.getElementById('result').innerHTML = '<p>Error adding vehicle. Please try again later.</p>';
                }
            });
        } else {
            console.error('Profile form not found.');
        }
    });
} catch (error) {
    console.error('Error attaching event listener:', error);
}

