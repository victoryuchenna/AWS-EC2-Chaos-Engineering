var http = require("http");
var mysql = require('mysql');
var AWS = require('aws-sdk');

var db = mysql.createConnection({
  host: 'hm1gsu8jb9nqdvg.ckqc4dnfzj72.eu-west-2.rds.amazonaws.com',
  user: 'admin',
  password: 'DbPassword',
  database: 'iptracker'
});

db.connect();

var SERVER_PORT = 8080;

var metadata = {};
var META = new AWS.MetadataService();
META.request('/latest/dynamic/instance-identity/document', function (err, data) {
  metadata = JSON.parse(data);
  META.request('/latest/meta-data/local-hostname', function (err, data) {
    metadata['privateHostname'] = data;
  });
});

function writeResponse(message, content, link, imageUrl, res) {
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
                    <img src="${imageUrl}" alt="" width="700">
                </body>
            </html>`);
}

var server = http.createServer(function (req, res) {
  console.log("Node.js web server handling request..");
  if (req.url == "/") {
    var webSiteImageUrl = "https://aws-well-architected-labs-ohio.s3.us-east-2.amazonaws.com/images/Cirque_of_the_Towers.jpg";
    message = `Data from the metadata API`;
    content = `
      accountId: ${metadata.accountId}<br/>
      amiId: ${metadata.imageId}<br/>
      availabilityZone: ${metadata.availabilityZone}<br/>
      instanceId: ${metadata.instanceId}<br/>
      instanceType: ${metadata.instanceType}<br/>
      privateHostname: ${metadata.privateHostname}<br/>
      privateIp: ${metadata.privateIp}<br/>
    `;

    db.query("INSERT INTO hits(ip) values (?)", [req.socket.remoteAddress], function (error, results, fields) {
      if (error) throw error;
    });

    // set response header
    res.writeHead(200, { "Content-Type": "text/html" });

    writeResponse(message, content, "/data", webSiteImageUrl, res);

    res.end();
  } else
    if (req.url == "/data") {
      console.log("Providing detailed response");


      // set response header
      res.writeHead(200, { "Content-Type": "text/html" });

      message = `Data from the database`;

      db.query('SELECT * FROM hits ORDER BY time DESC LIMIT 10', function (error, results, fields) {
        if (error) throw error;
        // console.log (results);
        content = '';
        Object.keys(results).forEach(function (key) {
          var row = results[key];
          // console.log (row);
          content += 'ip = ' + row.ip + ' \t time = ' + row.time + '<br/>';
        });

              writeResponse(message, content, "/", "", res);
              res.end();
      });

    } else {
      res.end("Invalid Request!");
    }
});

server.listen(SERVER_PORT);

console.log(`Node.js web server at port ${SERVER_PORT} is running..`);