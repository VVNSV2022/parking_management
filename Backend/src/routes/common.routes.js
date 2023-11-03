const {CustomRoutes, CustomResponse} = require('../utilities/server');
const path = require('path');
const fs = require('fs');
const commonRouter = new CustomRoutes();

commonRouter.get('/resources/styles/reservation.css', async (req, res) => {
    const resourcePath = path.join(__dirname, '../../../frontend/Customer/',req.url);
     //console.log("resourcePath",resourcePath);
    fs.readFile(resourcePath, (err, data) => {
      if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      } else {
          res.writeHead(200);
          res.end(data);
      }
  });
});

commonRouter.get('/resources/scripts/main.js', async (req, res) => {
    const resourcePath = path.join(__dirname, '../../../frontend/Customer/',req.url);
     //console.log("resourcePath",resourcePath);
    fs.readFile(resourcePath, (err, data) => {
      if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      } else {
          res.writeHead(200);
          res.end(data);
      }
  });
});

commonRouter.get('/resources/images/searchicon.png', async (req, res) => {
    const resourcePath = path.join(__dirname, '../../../frontend/Customer/',req.url);
     //console.log("resourcePath",resourcePath);
    fs.readFile(resourcePath, (err, data) => {
      if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      } else {
          res.writeHead(200);
          res.end(data);
      }
  });
});

commonRouter.get('/manager/resources/styles/reservation.css', async (req, res) => {
    const resourcePath = path.join(__dirname, '../../../frontend/',req.url);
     //console.log("resourcePath",resourcePath);
    fs.readFile(resourcePath, (err, data) => {
      if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      } else {
          res.writeHead(200);
          res.end(data);
      }
  });
});

commonRouter.get('/manager/resources/scripts/main.js', async (req, res) => {
    const resourcePath = path.join(__dirname, '../../../frontend/',req.url);
     //console.log("resourcePath",resourcePath);
    fs.readFile(resourcePath, (err, data) => {
      if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      } else {
          res.writeHead(200);
          res.end(data);
      }
  });
});

commonRouter.get('/manager/resources/images/searchicon.png', async (req, res) => {
    const resourcePath = path.join(__dirname, '../../../frontend/',req.url);
     //console.log("resourcePath",resourcePath);
    fs.readFile(resourcePath, (err, data) => {
      if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      } else {
          res.writeHead(200);
          res.end(data);
      }
  });
});

module.exports = commonRouter;