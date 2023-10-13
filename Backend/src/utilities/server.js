const http = require('http');
const url = require('url');

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

      if (method == 'PUT' || method == 'POST' || method == 'DELETE') {
        await new Promise((resolve, reject) => {
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
        });
      }

      // req.url, req.raw_headers
      res.setHeader('Powered_by', 'Team11');

      if (this.routes[method] && this.routes[method][parsedURL.pathname]) {
        console.debug(`${method}: ${parsedURL.pathname} is requested`);

        // calling the handler function
        this.routes[method][parsedURL.pathname](req, res, parsedURL);
      } else {
        // could not find any route in the server
        this.handleNotFound(res, method, parsedURL);
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
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Server cannot found request route');
    res.end('Not Found');
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
   *
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

module.exports = {CustomServer, CustomResponse, CustomRequest, CustomRoutes};
