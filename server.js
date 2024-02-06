// Initialising node modules
var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var sql = require("mssql");
var methodOverride = require("method-override"); // Added method-override module
var app = express();
const path = require('path');
const { json } = require("body-parser");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const ip = '127.0.0.1';
const port = '4040';

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: 'text/html' }));

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST']
}));

app.use(
  express.urlencoded({
    extended: true
  }));

// CORS Middleware
app.use(function (_req, res, next) {
  // Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE"); // Added DELETE method
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});

// Method Override Middleware
app.use(methodOverride('_method')); // Activate method override

// Setting up server
var server = app.listen(process.env.PORT || 4040, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
  console.log(`server running at http://${ip}:${port}/`);
});

// Initialising connection string
var dbConfig = {
  user: "Dragon",
  password: "dragon",
  server: "DESKTOP-13VJ050",
  database: "Node",
  synchronize: true,
  trustServerCertificate: true,
  port: 1433,
  dialectOptions: {
    instanceName: "SQLExpress"
  }
};

var items = [];

// Function to connect to the database and execute a query

// GET ALL ACTIVE USERS FOR PATHWAYS
app.get("/", function (_req, res) {
  var query = "select * from Studentinfo";
  sql.connect(dbConfig, function (err) {
    if (err) console.log(err);
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.query(query, function (err, recordset) {
      if (err) console.log(err)
      for (let [key, value] of Object.entries(recordset)) {
        if (key === "recordset") {
          items = [];
          for (var i = 0; i < value.length; i++) {
            item = [];
            item['id'] = value[i].ID;
            item['name'] = value[i].Name;
            item['age'] = value[i].Age;
            items.push(item);
          }
        }
      }
      console.log('--------------------');
      res.render('index', { title: 'items', items: items });
      res.end;
    });
  });
});

// POST API
app.post("/user", function (req, res) {
  userid = req.body["dropDown"];
  var query = "select * from Studentinfo where ID = " + "'" + userid[0] + "'";
  sql.connect(dbConfig, function (err) {
    if (err) console.log(err);
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.query(query, function (err, recordset) {
      if (err) console.log(err)
      for (let [key, value] of Object.entries(recordset)) {
        if (key === "recordset") {
          items = [];
          for (var i = 0; i < value.length; i++) {
            item = [];
            item['id'] = value[i].ID;
            item['name'] = value[i].Name;
            item['age'] = value[i].Age;
            items.push(item);
          }
        }
      }
      if (items.length > 0) {
        //console.log("length greater than 0");
      } else {
        //console.log("length equal 0");
      }

      res.render('table', { title: 'items', items: items });
      res.end;
    });
  });
});

// PUT API
app.put("/api/user/:id", function (req, res) {
  var query = "UPDATE Studentinfo SET Name= '" + req.body.Name + "', Age= " + req.body.Age + " WHERE ID= " + req.params.id;
  executeQuery(res, query);
});

// ADD API
app.post("/add-student", function (req, res) {
  var query = "INSERT INTO Studentinfo (Name, Age) VALUES ('" + req.body.name + "', " + req.body.age + ")";
  executeQuery(res, query);
});

app.get("/add-student", function (_req, res) {
  res.render("add-student", { title: "Add Student" });
});

// GET SINGLE USER (FOR EDITING)
app.get("/edit-student/:id", function (req, res) {
  var userId = req.params.id;
  var query = "SELECT * FROM Studentinfo WHERE ID = " + userId;

  // Connect to the database and execute the query
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      var request = new sql.Request();
      request.query(query, function (err, recordset) {
        if (err) {
          console.log(err);
          res.status(500).send("Database Error");
        } else {
          // If a record with the given ID is found, render the edit-student view
          if (recordset && recordset.length > 0) {
            res.render("edit-student", { title: "Edit Student", student: recordset[0] });
          } else {
            res.status(404).send("User Not Found");
          }
        }
      });
    }
  });
});

// DELETE API
app.delete("/delete-student/:id", function (req, res) {
  var query = "DELETE FROM Studentinfo WHERE ID=" + req.params.id;
  executeQuery(res, query);
});

function executeQuery(res, query) {
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      var request = new sql.Request();
      request.query(query, function (err, _result) {
        if (err) {
          console.log(err);
          res.status(500).send("Database Error");
        } else {
          res.status(200).send("Operation successful");
        }
      });
    }
  });
}
