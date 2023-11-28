const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

/**
 * CustomResponse class for handling HTTP response related operations.
 */
class CustomResponse {
  /**
   * Set an HTTP response header.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @param {string} key - The header key.
   * @param {string} value - The header value.
   */
  setResponseHeader(res, key, value) {
    res.setHeader(key, value);
  }

  /**
   * Remove an HTTP response header.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @param {string} key - The header key to remove.
   */
  removeResponseHeader(res, key) {
    res.removeHeader(key);
  }

  /**
   * Set an HTTP response with a JSON body.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @param {Object} body - The response body as an object.
   * @param {number} [statusCode=200] - The HTTP status code (default is 200).
   * @param {Object} [headers={}] - Custom headers to set in the response.
   */
  setResponse(res, body, statusCode = 200, headers = {}) {
    if (!headers['Content-Type'] && !res.getHeader('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }

    res.writeHead(statusCode, headers);

    res.end(JSON.stringify(body));
  }

  /**
   *
   * @param {http.ServerResponse} res - response object
   * @param {String} key - cookie key value
   * @param {String} value - cookie value for index key
   * @param {Object} options - options to set the cookie
   */
  setCookies(res, ...cookies) {
    const cookieStrings = cookies.map((cookie) => {
      const {key, value, options} = cookie;
      let cookieString = `${key}=${value}`;

      if (options && options.expires) {
        cookieString += `; Expires=${options.expires.toUTCString()}`;
      }
      if (options && options.path) {
        cookieString += `; Path=${options.path}`;
      }
      if (options && options.domain) {
        cookieString += `; Domain=${options.domain}`;
      }
      if (options && options.secure) {
        cookieString += `; Secure`;
      }
      if (options && options.httpOnly) {
        cookieString += `; HttpOnly`;
      }

      return cookieString;
    });
    res.setHeader('Set-Cookie', cookieStrings);
  }

  /**
   *
   * @param {http.CustomResponse} res - http Custom response object
   * @param {String} key - Cookie with index key
   */
  removeCookies(res, ...keys) {
    const cookies = res.getHeader('Set-Cookie');
    let finalCookies;
    if (cookies) {
      // Remove specified cookies based on keys
      finalCookies = cookies.map((cookie)=>{
        const key = cookie.split('=')[0];
        if (keys.includes(key)) {
          return `${key}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        return cookie;
      });
    }
    // After removing the cookies, set the updated cookies in the response.
    res.setHeader('Set-Cookie', finalCookies);
    // this.setCookies(res, finalCookies.map((cookie) => ({key: cookie.split('=')[0], value: cookie.split('=')[1],})));
  }
}
/**
 * CustomRequest class for handling HTTP request related operations.
 */
class CustomRequest {
  /**
   * Get a request header value.
   * @param {http.IncomingMessage} req - The HTTP request object.
   * @param {string} key - The header key to retrieve.
   * @return {string} - The header value.
   */
  getRequestHeader(req, key) {
    return req.headers[key];
  }
}

/**
 * Custom Router class for creating routes for easy development
 */
class CustomRoutes {
  /**
   * Creates a Custom Route Instance
   */
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };
  }
  /**
   * Register a GET route.
   * @param {string} url - The URL path for the GET route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  get(url, handler) {
    this.routes.GET[url] = handler;
  }

  /**
   * Register a POST route.
   * @param {string} url - The URL path for the POST route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  post(url, handler) {
    this.routes.POST[url] = handler;
  }

  /**
   * Register a PUT route.
   * @param {string} url - The URL path for the PUT route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  put(url, handler) {
    this.routes.PUT[url] = handler;
  }

  /**
   * Register a DELETE route.
   * @param {string} url - The URL path for the DELETE route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  delete(url, handler) {
    this.routes.DELETE[url] = handler;
  }
}

/**
 * CustomServer class for creating an HTTP server \
 * with routing and middleware support.
 */
class CustomServer {
  /**
   * Create a CustomServer instance.
   */
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };

    // creating the server
    this.server = http.createServer(async (req, res) => {
      const method = req.method;
      const parsedURL = url.parse(req.url, true);
      req.queryParameters = parsedURL.query;
      // parsing the cookies
      this.parseCookies(req);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

      // if the url ends with .html, .css, .js, .png, .jpg, .jpeg, .gif, .ico then we have to serve the static files
      if (method == 'GET' && req.url.split('?')[0].match(/\.(html|css|js|png|jpg|jpeg|gif|ico)$/)) {
        const filePath = path.join(__dirname, '..', '..', '..', 'UI', req.url.split('?')[0]);
        const extname = path.extname(filePath).toLowerCase();

        fs.access(filePath, fs.constants.R_OK, (err) => {
          if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write('<h1 color:"red">Server Error</h1>');
            res.end();
          } else {
            fs.readFile(filePath, (err, data) => {
              if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
              } else {
                res.writeHead(200, {'Content-Type': `text/${extname.slice(1)}`});
                res.end(data);
              }
            });
          }
        });
      } else {
        const parsedURL = url.parse(req.url, true);
        req.queryParameters = parsedURL.query;

        // parsing the cookies
        this.parseCookies(req);

        if (method == 'PUT' || method == 'POST' || method == 'DELETE') {
          await new Promise((resolve, reject) => {
            if (req.headers['content-type'] === 'application/json') {
              let body = '';
              // Handle incoming data in the request
              req.on('data', (chunk) => {
                body += chunk;
              });

              req.on('end', async () => {
                try {
                  // Parse the received data as JSON
                  if (body) {
                    req.body = await JSON.parse(body);
                  } else {
                    req.body = {};
                  }
                  resolve();
                } catch (err) {
                  req.body = {}; // Set an empty object if parsing fails
                  console.log(
                      'Error Occurred while getting the data from the request object',
                      err,
                  );
                  reject(err);
                }
              });
            } else {
              const body = [];
              // Handle incoming data in the request
              req.on('data', (chunk) => {
                body.push(chunk);
              });

              req.on('end', async () => {
                try {
                  // Parse the received data as JSON
                  if (body) {
                    req.file = Buffer.concat(body);
                    req.fileType = req.headers['content-type'];
                  } else {
                    req.file = '';
                  }
                  resolve();
                } catch (err) {
                  req.body = ''; // Set an empty object if parsing fails
                  console.log(
                      'Error Occurred while getting the data from the request object',
                      err,
                  );
                  reject(err);
                }
              });
            }
          });
        }

        // req.url, req.raw_headers
        res.setHeader('Powered_by', 'Team9');

        if (this.routes[method] && this.routes[method][parsedURL.pathname]) {
          console.debug(`${method}: ${parsedURL.pathname} is requested`);

          // calling the handler function
          this.routes[method][parsedURL.pathname](req, res, parsedURL);
        } else {
        // could not find any route in the server
          this.handleNotFound(res, method, parsedURL);
        }
      }
    });


    // basic error handler
    this.server.on('error', (err) => {
      this.handleServerError(err);
    });
  }

  /**
   * Handle a 404 Not Found error.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @param {string} method - http protocol used
   * @param {string} parsedURL - parsed url
   */
  handleNotFound(res, method, parsedURL) {
    console.error(
        `${method}: ${parsedURL.pathname} is requested but cannot find it in the server`,
    );
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('<h1 color="red">Server cannot found request route</h1>');
    res.end('');
  }

  /**
   * Handle a server error.
   * @param {Error} err - The error object representing the server error.
   */
  handleServerError(err) {
    console.error('Server error:', err.message);
  }

  /**
   * Register a GET route.
   * @param {string} url - The URL path for the GET route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  get(url, handler) {
    this.routes.GET[url] = handler;
  }

  /**
   * Register a POST route.
   * @param {string} url - The URL path for the POST route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  post(url, handler) {
    this.routes.POST[url] = handler;
  }

  /**
   * Register a PUT route.
   * @param {string} url - The URL path for the PUT route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  put(url, handler) {
    this.routes.PUT[url] = handler;
  }

  /**
   * Register a DELETE route.
   * @param {string} url - The URL path for the DELETE route.
   * @param {Function} handler - The handler function to execute when the route is matched.
   */
  delete(url, handler) {
    this.routes.DELETE[url] = handler;
  }

  /**
   *
   * @param {http.ServerRequest} req - http request object
   */
  parseCookies(req) {
    req.cookies = {};
    if (req.headers.cookie) {
      const cookieHeader = req.headers.cookie;
      cookieHeader.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        const name = parts[0].trim();
        const value = decodeURIComponent(parts[1]);
        req.cookies[name] = value;
      });
    } else {
      req.cookies = {};
    }
  }

  /**
   * Set routes from a CustomRoutes object.
   * @param {CustomRoutes} customRoutes - The CustomRoutes object containing routes to be added.
   */
  setRoutes(customRoutes) {
    // Get the routes from the CustomRoutes object
    const {GET, POST, PUT, DELETE} = customRoutes.routes;

    // Add the routes to the server's routes
    this.routes.GET = {...this.routes.GET, ...GET};
    this.routes.POST = {...this.routes.POST, ...POST};
    this.routes.PUT = {...this.routes.PUT, ...PUT};
    this.routes.DELETE = {...this.routes.DELETE, ...DELETE};
  }
  /**
   * Start listening on the specified port.
   *
   * @param {number} port - The port number to listen on.
   * @param {Function} [callback] - Optional callback function to execute when the server starts listening.
   */
  listen(port, callback) {
    this.server.listen(port, callback);
  }
}
// CustomServer.use(cors());
module.exports = {CustomServer, CustomResponse, CustomRequest, CustomRoutes};
