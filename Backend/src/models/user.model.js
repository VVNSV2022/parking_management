const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the address schema
const addressSchema = new Schema({
  streetNumber: String,
  aptUnit: String,
  city: String,
  state: String,
  zipcode: {
    type: String,
    validate: {
      validator: function(zipcode) {
        // Simple regex pattern for ZIP code validation (5-digit ZIP)
        return /^\d{5}$/.test(zipcode);
      },
      message: 'Invalid ZIP code format. Should be a 5-digit number.',
    },
  },
});

// Define the user schema with validations
const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
    maxLength: [50, 'Firstname cannot exceed 50 characters.'],
    minLength: 3,
  },
  lastname: {
    type: String,
    required: true,
    maxLength: [50, 'Lastname cannot exceed 50 characters.'],
    minLength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function(email) {
        // Simple regex pattern for email validation
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
      },
      message: 'Invalid email address format.',
    },
  },
  username: {
    type: String,
    required: true,
    maxLength: [150, 'Username cannot exceed 150 characters.'],
    minLength: [3, 'Username is too short'],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    maxLength: [150, 'Password cannot exceed 150 characters.'],
    minLength: [3, 'Password is too short'],
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(dob) {
        const ageDiff = Date.now() - new Date(dob);
        const age = new Date(ageDiff);
        // Check if the user is at least 16 years old
        return age.getUTCFullYear() - 1970 >= 16;
      },
      message: 'User must be at least 16 years old.',
    },
  },
  currentAddress: addressSchema,
  permanentAddress: addressSchema,
  licenseNumber: {type: String},
  disabled: {type: Boolean},
  userActive: {type: Boolean, default: true},
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
