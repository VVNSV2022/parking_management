/**
 * Variables
 */
const signupButton = document.getElementById('signup-button'),
    loginButton = document.getElementById('login-button'),
    userForms = document.getElementById('user_options-forms')

/**
 * Add event listener to the "Sign Up" button
 */
signupButton.addEventListener('click', () => {
  userForms.classList.remove('bounceRight')
  userForms.classList.add('bounceLeft')
}, false)

/**
 * Add event listener to the "Login" button
 */
loginButton.addEventListener('click', () => {
  userForms.classList.remove('bounceLeft')
  userForms.classList.add('bounceRight')
}, false)

function validateForm() {
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
  } else {
    alert("Registration successful!");
    // Additional logic for form submission can be added here
  }
}

function login(event) {
  event.preventDefault();

  var email = document.getElementById("loginEmail").value;
  var password = document.getElementById("loginPassword").value;

  // Make HTTP request for login using the provided API endpoint
  fetch("/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      // Read the response as JSON
      return response.json();
    })
    .then(data => {
      console.log(data);
      sessionStorage.setItem("accessToken", data["accessToken"]);
      sessionStorage.setItem("refreshToken", data["refreshToken"]);
      // Redirect to the home page or perform other actions
      window.location.replace("../index.html");
    })
    .catch(error => {
      console.log("Login error: ", error);
      alert("Login failed. Please check your credentials and try again.");
    });
}

function displayRadioValue(name) {
  var ele = document.getElementsByName(name);

  for (i = 0; i < ele.length; i++) {
      if (ele[i].checked)
        return ele[i].value;
  }
}

function signup(event) {
  event.preventDefault();

  var username = document.getElementById("username").value;
  var email = document.getElementById("signupEmail").value;
  var password = document.getElementById("signupPassword").value;
  var confirmPassword = document.getElementById("confirmPassword").value;
  var dob = document.getElementById("dob").value;
  var licenseNumber = document.getElementById("licenseNumber").value;
  var currentAddress = document.getElementById("currentAddress").value;
  var permanentAddress = document.getElementById("permanentAddress").value;
  var phoneNumber = document.getElementById("phoneNumber").value;
  var disabled = (displayRadioValue("disabled") === "true");

  // Check if passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Make HTTP request for registration using the provided API endpoint
  fetch("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      username: username,
      dob: dob,
      licenseNumber: licenseNumber,
      isDisabled: disabled,
      currentAddress: currentAddress,
      permanentAddress: permanentAddress,
      phoneNumber: phoneNumber
    }),
  })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      // Read the response as JSON
      return response.json();
    })
    .then(data => {
      console.log(data);
      location.reload();
      alert("Registration Successfull");
      // Redirect to the home page or perform other actions
    })
    .catch(error => {
      alert("Registration failed: "+error.message);
    });
}