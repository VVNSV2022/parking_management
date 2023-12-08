// Include the following JavaScript code in your reset-password.js file

function resetPassword(event) {
    event.preventDefault();
  
    var email = document.querySelector(".forms_field-input").value;
  
    // Make HTTP request for password reset using the appropriate API endpoint
    fetch("/api/customer/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then(response => response.json())
      .then(data => {
        alert("Password reset successful! Check your email for further instructions.");
        // Redirect to login page or perform other actions
      })
      .catch(error => {
        alert("Password reset failed. Please try again later.");
      });
  }
  