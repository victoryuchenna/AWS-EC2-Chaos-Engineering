/** 
 * the following is based on code from the binary tree NodeJS implemenation 
 * found at 
 * https://benchmarksgame-team.pages.debian.net/benchmarksgame/program/binarytrees-node-6.html  
 **/
var http = require("http");
var mysql = require('mysql');
var AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const commandLineArgs = require('command-line-args');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  mainThread();
} else {
  workerThread(workerData);
}

function mainThread() {
  const optionDefinitions = [
    { name: 'port', alias: 'p', type: Number, defaultOption: 80 },
    { name: 'dbhost', alias: 'h', type: String },
    { name: 'dbuser', alias: 'u', type: String },
    { name: 'dbpass', alias: 's', type: String },
    { name: 'dbname', alias: 'd', type: String }
  ]
  const options = commandLineArgs(optionDefinitions);
  console.log(options);

  var db = mysql.createConnection({
    host: options.dbhost,
    user: options.dbuser,
    password: options.dbpass,
    database: options.dbname
  });

  db.connect();

  var SERVER_PORT = options.port;

  var metadata = {};
  var META = new AWS.MetadataService();
  META.request('/latest/dynamic/instance-identity/document', function (err, data) {
    metadata = JSON.parse(data);
    META.request('/latest/meta-data/local-hostname', function (err, data) {
      metadata['privateHostname'] = data;
    });
  });

  var server = http.createServer(function (req, res) {
    var rqstId = uuidv4();
    console.log(new Date(), `handling request ${rqstId} from ${req.socket.remoteAddress} for ${req.url}`);

    doBusyWork(6);

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
        console.log(new Date(), `request ${rqstId}, Providing detailed response`);

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

  console.log(new Date(), `Node.js web server at port ${SERVER_PORT} is running..`);
}

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


/* The Computer Language Benchmarks Game
   https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

   contributed by Léo Sarrazin
   multi thread by Andrey Filatkin
*/

async function doBusyWork(treeDepth) {
  const maxDepth = treeDepth; // Math.max(6, treeDepth);

  const stretchDepth = maxDepth + 1;
  const check = itemCheck(bottomUpTree(stretchDepth));

  const longLivedTree = bottomUpTree(maxDepth);

  const tasks = [];
  for (let depth = 4; depth <= maxDepth; depth += 2) {
    const iterations = 1 << maxDepth - depth + 4;
    tasks.push({ iterations, depth });
  }

  const results = await runTasks(tasks);
}

function workerThread({ iterations, depth }) {
  parentPort.postMessage({
    result: work(iterations, depth)
  });
}

function runTasks(tasks) {
  return new Promise(resolve => {
    const results = [];
    let tasksSize = tasks.length;

    for (let i = 0; i < tasks.length; i++) {
      const worker = new Worker(__filename, { workerData: tasks[i] });

      worker.on('message', message => {
        results[i] = message.result;
        tasksSize--;
        if (tasksSize === 0) {
          resolve(results);
        }
      });
    }
  });
}

function work(iterations, depth) {
  let check = 0;
  for (let i = 0; i < iterations; i++) {
    check += itemCheck(bottomUpTree(depth));
  }
  return `${iterations}\t trees of depth ${depth}\t check: ${check}`;
}

function TreeNode(left, right) {
  return { left, right };
}

function itemCheck(node) {
  if (node.left === null) {
    return 1;
  }
  return 1 + itemCheck(node.left) + itemCheck(node.right);
}

function bottomUpTree(depth) {
  return depth > 0
    ? new TreeNode(bottomUpTree(depth - 1), bottomUpTree(depth - 1))
    : new TreeNode(null, null);
}