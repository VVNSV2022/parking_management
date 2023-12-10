const request = require('request');
const fs = require('fs');
const app = require('../src/index');

const userFileData = 'spec/data/users.json';
const userData = JSON.parse(fs.readFileSync(userFileData, 'utf8'));

describe('User API', () => {
  let userCredentials;

  beforeAll((done) => {
    const user = userData.users[0];

    // Register a new user
    request.post(
      {
        url: 'http://localhost:4000/user/register',
        json: user,
      },
      (error, response, body) => {
        expect(response.statusCode).toBe(200);
        expect(body.message).toBe('Registration successful');

        // Save user credentials for login
        userCredentials = {
          email: user.email,
          password: user.password,
        };

        done();
      }
    );
  });

  it('should log in an existing user', (done) => {
    request.post(
      {
        url: 'http://localhost:4000/user/login',
        json: userCredentials,
      },
      (error, response, body) => {
        expect(response.statusCode).toBe(200);
        expect(body.message).toBe('Login successful');
        done();
      }
    );
  });

  it('should log out a logged-in user', (done) => {
    // Perform user login before logout
    request.post(
      {
        url: 'http://localhost:4000/user/login',
        json: userCredentials,
      },
      (loginError, loginResponse, loginBody) => {
        const accessToken = loginBody.accessToken;

        request.post(
          {
            url: 'http://localhost:4000/user/logout',
            json: {},
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          (error, response, body) => {
            expect(response.statusCode).toBe(200);
            expect(body.message).toBe('Logout successful');
            done();
          }
        );
      }
    );
  });

 
  it('should delete the user after logout', (done) => {
    // Use the userCredentials to authenticate and delete the user
    request.post(
      {
        url: 'http://localhost:4000/user/login',
        json: userCredentials,
      },
      (loginError, loginResponse, loginBody) => {
        const accessToken = loginBody.accessToken;
  
        request.delete(
          {
            url: 'http://localhost:4000/user/delete',
            json: { userId: 'your_user_id_here' }, // Include the user ID in the JSON body
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          (error, response, body) => {
            expect(response.statusCode).toBe(200);
            expect(body.message).toBe('User deleted successfully');
            done();
          }
        );
      }
    );
  });
  

  afterAll((done) => {

    done();
  });
});