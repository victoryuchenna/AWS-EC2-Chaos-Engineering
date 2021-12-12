var http = require("http");

var SERVER_PORT = 8080;
var WEB_SITE_IMAGE_URL =
  "https://i.chzbgr.com/full/875511040/h8EB4D6E9/famous-cat-meme-which-started-and-launched-the-website-i-can-haz-cheezburger";

function writeResponse(message, content, link, res) {
  // set response content
  res.write(`
	    <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Resiliency Workshop!</title>
                </head>
                <body>
                    <h1>Welcome to the Resiliency Workshop!</h1>
                    <p>${message}</p>
                    <p>${content}</p>
                    <p><a href="${link}">click here to go to other page</a></p>
                    <img src="${WEB_SITE_IMAGE_URL}" alt="" width="700">
                </body>
            </html>`);
}

var server = http.createServer(function (req, res) {
  console.log("Node.js web server handling request..");
  if (req.url == "/") {
    message = `Data from the metadata API`;
    content = `
      accountId<br/>
      amiId<br/>
      availabilityZone<br/>
      instanceId<br/>
      instanceType<br/>
      privateHostname<br/>
      privateIp<br/>
    `;

    // set response header
    res.writeHead(200, { "Content-Type": "text/html" });

    writeResponse(message, content, "/data", res);

    res.end();
  }
  if (req.url == "/data") {
    console.log("Providing detailed response");
    message = `Data from the database`;
    content = `
      ip = 127.0.0.1   time = 10:27 am<br/>
      ip = 10.0.0.1   time = 09:23 am<br/>
    `;

    // set response header
    res.writeHead(200, { "Content-Type": "text/html" });
    writeResponse(message, content, "/", res);
    res.end();
  } else {
    res.end("Invalid Request!");
  }
});

server.listen(SERVER_PORT);

console.log(`Node.js web server at port ${SERVER_PORT} is running..`);