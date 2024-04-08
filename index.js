// Import the 'http' module
const fs = require("fs");
const xlsx = require("xlsx");
const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv").config();
const multer = require("multer");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authenticateToken");
var nodemailer = require("nodemailer");
const app = express();
const { chromium } = require('playwright'); 
const axios = require('axios')
const crypto = require('crypto');

const connection = mysql.createConnection({
  // host: "127.0.0.1",
  // user: "root",
  // password: "",
  host: "mysql-b381c19-topdeveloper0908-78b3.a.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_PASNkVVJ8_WuABxGPwj",
  // password: "Practitioner@2024",
  database: "practitioner",
  // port: '/var/run/mysqld/mysqld.sock',
  port: '11666',
});

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function logindata(login, password) {
  const keyParts = [0x23, 0xfa, 0x49, 0xac, 0xf4, 0xd4, 0x2a, 0x0c];

  let s = login + '|||' + md5(password) + '|||biowell';

  let text = String.fromCharCode(Math.floor(Math.random() * 256)) + 'AA' + s;

  let pos = 0;
  let cnt = text.length;
  let lastChar = 0;

  while (pos < cnt) {
      text = text.substr(0, pos) + String.fromCharCode(text.charCodeAt(pos) ^ keyParts[pos % 8] ^ lastChar) + text.substr(pos + 1);
      lastChar = text.charCodeAt(pos);
      pos++;
  }

  return btoa(String.fromCharCode(3) + String.fromCharCode(2) + text);
}

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("Connected to MySQL as ID " + connection.threadId);
});
const corsOptions = {
  origin: '*', // Replace with your allowed origin
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Replace with the actual origin of your frontend
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(bodyParser.json());
app.get("/api/all", authenticateToken, (req, res) => {
  var data = [];
  connection.query(
    "SELECT * FROM practitioner_list",
    (error, results, fields) => {
      if (error) throw error;
      data = JSON.stringify(results);
      res.json(results);
    }
  );
  // Send the data as a JSON response
});
app.get("/api/data", (req, res) => {
  var data = [];
  connection.query(
    "SELECT * FROM practitioner_list WHERE status = ?",
    ["active"],
    (error, results, fields) => {
      if (error) throw error;
      data = JSON.stringify(results);
      res.json(results);
      return;
    }
  );
  // Send the data as a JSON response
});
app.get("/api/metaData", (req, res) => {
  var data = [];
  connection.query(
    "SELECT * FROM practitioner_list",
    (error, results, fields) => {
      if (error) throw error;
      var specs = [];
      var tags = [];
      data = JSON.stringify(results);
      results.forEach((element) => {
        if (element.specialty != "") {
          specArray = element?.specialty?.split(",");
          specArray.forEach((subElement) => {
            var value;
            if (subElement.charAt(0) == " ") {
              value = subElement.substring(1);
            } else {
              value = subElement;
            }
            if (specs.indexOf(value) == -1) {
              specs.push(value);
            }
          });
        }
        if (element.specialty != "") {
          tagArray = element.tags.split(",");
          tagArray.forEach((subElement) => {
            var value;
            if (subElement.charAt(0) == " ") {
              value = subElement.substring(1);
            } else {
              value = subElement;
            }
            if (tags.indexOf(value) == -1) {
              tags.push(value);
            }
          });
        }
      });
      data = {
        tags: tags,
        specs: specs,
      };
      res.json(data);
    }
  );
  // Send the data as a JSON response
});
app.post("/api/new", authenticateToken, (req, res) => {
  var newData = req.body;
  connection.query(
    "Select * FROM practitioner_list WHERE email = ?",
    [newData.email],
    (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json("duplicated");
      } else {
        connection.query(
          "INSERT INTO practitioner_list (firstname, lastname, specialty, imageURL, upload, tags, meetinglink, address, city, state, zipcode, country, email, phone, sex, profileLink, availability, type, hide) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            newData.firstname,
            newData.lastname,
            newData.specialty,
            newData.imageURL,
            newData.upload,
            newData.tags,
            newData.meetinglink,
            newData.address,
            newData.city,
            newData.state,
            newData.zipcode,
            newData.country,
            newData.email,
            newData.phone,
            newData.sex,
            newData.profileLink,
            newData.availability,
            newData.type,
            newData.hide
          ],
          (error, results, fields) => {
            if (error) throw error;
            console.log("Inserted a new row with ID:", results.insertId);
            res.json("success");
          }
        );
      }
    }
  );
});
app.post("/api/admin_new", authenticateToken, (req, res) => {
  var newData = req.body;
  connection.query(
    "Select * FROM practitioner_list WHERE email = ?",
    [newData.email],
    (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json("duplicated");
      } else {
        connection.query(
          "INSERT INTO practitioner_list (firstname, lastname, specialty, imageURL, upload, tags, meetinglink, address, city, state, zipcode, country, email, phone, sex, status, review, `rank`, profileLink, availability, type, hide) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            newData.firstname,
            newData.lastname,
            newData.specialty,
            newData.imageURL,
            newData.upload,
            newData.tags,
            newData.meetinglink,
            newData.address,
            newData.city,
            newData.state,
            newData.zipcode,
            newData.country,
            newData.email,
            newData.phone,
            newData.sex,
            newData.status,
            newData.review,
            newData.rank,
            newData.profileLink,
            newData.availability,
            newData.type,
            newData.hide
          ],
          (error, results, fields) => {
            if (error) throw error;
            console.log("Inserted a new row with ID:", results.insertId);
            res.json(results.insertId);
          }
        );
      }
    }
  );
});
app.post("/api/update", authenticateToken, (req, res) => {
  var newData = req.body;
  // Update operation
  const updateQuery =
    "UPDATE practitioner_list SET firstname =?, lastname =?, specialty =?, imageURL =?, tags =?, meetingLink =?, address =?, city =?, zipcode =?, state =?, phone =?, `rank` =?, review =?, email =?, country = ?, status =?, sex =?, hide =?, profileLink=?, availability = ?, type=?, upload=? WHERE id =?";
  const updateValues = [
    newData.firstname,
    newData.lastname,
    newData.specialty,
    newData.imageURL,
    newData.tags,
    newData.meetinglink,
    newData.address,
    newData.city,
    newData.zipcode,
    newData.state,
    newData.phone,
    newData.rank,
    newData.review,
    newData.email,
    newData.country,
    newData.status,
    newData.sex,
    newData.hide,
    newData.profileLink,
    newData.availability,
    newData.type,
    newData.upload,
    newData.id
  ]; // Replace with actual values
  connection.query(updateQuery, updateValues, (error, results, fields) => {
    if (error) throw error;
    console.log("Updated rows:", results.affectedRows);
    res.json("success");
  });
});
app.post("/api/updateDB", authenticateToken, async (req, res) => {
  var newData = req.body;
  console.log(newData);
  if (newData.replace) {
    await connection.query(
      "DELETE FROM practitioner_list",
      (error, results, fields) => {}
    );
    // Add Admin
    await connection.query(
      "INSERT INTO practitioner_list (firstname, lastname, specialty, imageURL, upload, tags, meetinglink, address, city, state, zipcode, country, email, phone, `rank`, review, status, role, password, sex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "Nima",
        "Farshid",
        "Bio-Well practitioner, Reiki Master, Sound Healer, Meditation Coach",
        "https://biohackingcongress.com/storage/users/June2023/9Q67Ebbs5rPLWWmWGZET.png",
        0,
        "Reiki, biowell, soundhealer, meditation",
        "https://calendly.com/nimafarshid/biowell",
        "11532 Via Lucerna Cir",
        "Windermere",
        "FL",
        "34786",
        "US",
        "nima02@yahoo.com",
        "407-230-8179",
        3,
        5,
        "active",
        0,
        "$2b$10$WZ9pp7nsSEcgglZD8W8oueFvDfSDKKY1VJ.wVWRGRKubqDlowH2UG",
        "Male",
      ],
      (error, results, fields) => {
        if (error) throw error;
      }
    );
  }
  // Add users
  newData.data.forEach(async (element, index) => {
    if (element["Email"] != "nima02@yahoo.com" && index != 0) {
      await connection.query(
        "INSERT INTO practitioner_list (firstname, lastname, specialty, imageURL, upload, tags, meetinglink, address, city, state, zipcode, country, email, phone, sex, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          element["First Name"] || "",
          element["Last Name"] || "",
          element["Specialty"] || "",
          element["ImageURL"] || "",
          0,
          element["Tags"] || "",
          element["MeetingLink"] || "",
          element["Address"] || "",
          element["City"] || "",
          element["State"] || "",
          element["Zipcode"] || "",
          element["Country"] || "",
          element["Email"] || "",
          element["Phone"] || "",
          element["Sex"],
          element["Availability"],
        ],
        (error, results, fields) => {
          if (error) throw error;
        }
      );
    }
  });
  res.json("success");
  // Update operation
  // const updateQuery = 'UPDATE practitioner_list SET firstname = ?, lastname = ?, specialty = ?, imageURL = ?, tags = ?, meetingLink = ?, address = ?, city = ?, zipcode = ?, state = ?, phone = ?, rank = ?, review = ?, email = ?, country = ?, status = ? WHERE id = ?';
  // const updateValues = [newData.firstname, newData.lastname, newData.specialty, newData.imageURL, newData.tags, newData.meetinglink, newData.address, newData.city, newData.zipcode, newData.state, newData.phone, newData.rank, newData.review, newData.email, newData.country, newData.status, newData.id]; // Replace with actual values
  // connection.query(updateQuery, updateValues, (error, results, fields) => {
  //     if (error) throw error;
  //     console.log('Updated rows:', results.affectedRows);
  //     res.json('success');
  // });
});
app.post("/api/user", authenticateToken, (req, res) => {
  var newData = req.body;
  // Update operation
  var newData = req.body;
  connection.query(
    "Select * FROM practitioner_list WHERE id = ?",
    [newData.id],
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
});
app.post("/api/remove", authenticateToken, (req, res) => {
  var newData = req.body;
  // Update operation
  connection.query(
    "DELETE FROM practitioner_list WHERE id = ?",
    [newData.id],
    (error, results, fields) => {
      if (error) throw error;
      console.log("Deleted rows:", results.affectedRows);
      res.json("success");
    }
  );
});
app.post("/api/login", async (req, res) => {
  const newData = req.body;
  console.log(await bcrypt.hash("Pass1234!", 10));
  // $2b$10$WZ9pp7nsSEcgglZD8W8oueFvDfSDKKY1VJ.wVWRGRKubqDlowH2UG
  try {
    const query = "SELECT * FROM practitioner_list WHERE email = ?;";
    connection.query(query, [newData.email], async (error, results, fields) => {
      if (error) throw error;
      user = results;
      console.log(results);
      if (user.length === 0) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      const passwordMatch = await bcrypt.compare(
        newData.password,
        user[0].password
      );
      if (!passwordMatch) {
        console.log("bbb");
        return res.status(401).json({ message: "Invalid credentials." });
      }
      const token = jwt.sign(
        { username: user[0].firstname + user[0].lastname, userId: user[0].id },
        'pk.eyJ1IjoibmltYTAyIiwiYSI6ImNsc2MzYTZ3NTBreDcya2xweXkzMHFycmgifQ.EtcXP_4uFqKJATsN4uW6bw',
        { expiresIn: "1h" }
      );
      res.json({ token });
      return;
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
app.post("/api/login_practitioner", async (req, res) => {
  const { email } = req.body;
  const query = "SELECT * FROM practitioner_list WHERE email = ?;";
  connection.query(query, [email], async (error, results, fields) => {
    if (error) throw error;
    user = results;
    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { username: user[0].firstname + user[0].lastname, userId: user[0].id },
      'pk.eyJ1IjoibmltYTAyIiwiYSI6ImNsc2MzYTZ3NTBreDcya2xweXkzMHFycmgifQ.EtcXP_4uFqKJATsN4uW6bw',
      { expiresIn: "1h" }
    );
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gaiahealersshopify@gmail.com",
        pass: "byep avju cnsz aqut",
      },
    });  
    var mailOptions = {
      from: "Gaia",
      to: email,
      subject: "Gaia Login",
      text: `Here is your login link: https://gaia-vercel-test-fe.vercel.app/user?token=${token}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      } else {
        console.log("Email sent: " + info.response);
        res.json({ message: "success" });
      }
    });
  });
});
app.get("/api/user", authenticateToken, (req, res) => {
  const { userId } = req.user;
  const query = "SELECT * FROM practitioner_list WHERE id = ?;";
  connection.query(query, [userId], async (error, results, fields) => {
    if (error) throw error;
    user = results;
    res.json(user);
  });
  return;
});
app.post("/api/hide_info", authenticateToken, (req, res) => {
  let { id } = req;
  try {
    // const query = "UPDATE hide_info SET hide=1 WHERE id = 1;";
    // first get the current status
    const query = "SELECT * FROM practitioner_list WHERE id = ?;";
    connection.query(query, [id], async (error, results, fields) => {
      if (error) throw error;
      user = results;
      const hide = user[0].hide == 1 ? 0 : 1;
      const updateQuery = "UPDATE practitioner_list SET hide = ? WHERE id = ?";
      const updateValues = [hide, id]; // Replace with actual values
      connection.query(updateQuery, updateValues, (error, results, fields) => {
        if (error) throw error;
        console.log("Updated rows:", results.affectedRows);
        res.json("success");
      });
    });
  } catch (error) {
    console.error("failed to hide:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Customer
app.post("/api/customer", authenticateToken, async (req, res) => {
  try {
    var newData = req.body;

    // Perform the database queries
    const query = "SELECT * FROM customer_list WHERE id = ?;";
    connection.query(query, newData.id, async (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
    
    // const results2 = await new Promise((resolve, reject) => {
    //   connection.query(
    //     "select * FROM bio_data WHERE customer_id = ?",
    //     [newData.id],
    //     (error, results, fields) => {
    //       if (error) reject(error);
    //       resolve(results);
    //     }
    //   );
    // });

    // Push results into the data array
    // data.push(results1);
    // data.push(results2);

    // if(results1.length > 0 && results1[0].h_email && results1[0].h_password && results1[0].h_key && results1[0].h_id) {

    //   var code = '';
    //   const driver = new webdriver.Builder().forBrowser("chrome").build();
    //   // Instantiate a web browser page
    //   await driver.navigate().to("https://heartcloud.com/oauth/authorize?response_type=code&client_id=gaia.t62stc3k899w2b4a3k5&scope=profile%20settings%20activity&state=i9z4d4315fFtoiuK7wP2b3A3b8npZv")
    //   .then(() => driver.findElement(webdriver.By.id('email')).sendKeys(results1[0].h_email))
    //   .then(() => driver.findElement(webdriver.By.id('password')).sendKeys(results1[0].h_password))
    //   .then(() => driver.findElement(webdriver.By.className('allow-button')).click())
    //   .then(() => driver.getCurrentUrl())
    //   .then((url) => {
    //     const urlString = url;
    //     const codeIndex = urlString.indexOf('code=') + 5; // Find the index where 'code=' ends
    //     const ampersandIndex = urlString.indexOf('&', codeIndex); // Find the index of the next '&' after 'code='
    //     code = urlString.substring(codeIndex, ampersandIndex !== -1 ? ampersandIndex : urlString.length);
    //   });
    
    //   var headers = {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': 'Basic Z2FpYS50NjJzdGMzazg5OXcyYjRhM2s1OnNGWUVIZjQ3NDZGSjM4MzRoQlpkc2RrcWZoMjNrRWZIZA=='
    //   };
    //   // Define the API endpoint URL
    //   var apiUrl = `https://heartcloud.com/oauth/token`;
    
    //   var accessToken;
    //   // Make a GET request to the API
    //   await axios.post(apiUrl, {
    //     grant_type: 'authorization_code',
    //     code: code
    //   }, {headers: headers})
    //     .then(response => {
    //       accessToken = response.data.access_token;
    //     })
    //     .catch(error => {
    //       console.error('Error fetching data from the API:', error);
    //     });
      
    //     var headers = {
    //       'Content-Type': 'application/json'
    //     };
        
    //     var param = {
    //       k: results1[0].h_key,
    //       t: accessToken,
    //       From: Date.now() / 1000 - 365 * 24 * 60 * 60,
    //       To: Date.now() / 1000
    //     };
    //     // Define the API endpoint URL
    //     var apiUrl = `https://api.heartcloud.com/api/v1/me/data/?access_token=${accessToken}`;
      
    //     // Make a GET request to the API
    //     await axios.post(apiUrl, param, {headers: headers})
    //       .then(response => {
    //         console.log('Data API Response:', response.data);
    //         data.push(response.data.Sessions);
    //       })
    //       .catch(error => {
    //         console.error('Error fetching data from the API:', error);
    //       });
        
    // }
  } catch (error) {
    // Handle errors here
    res.status(500).json({ error: "An error occurred" });
  }
});
app.post("/api/customer/bio", authenticateToken, (req, res) => {
  var newData = req.body;
  try {
    connection.query(
      "Select * FROM bio_data WHERE customer_id = ?",
      [newData.id],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});
app.post("/api/customer/bio/cards", authenticateToken, (req, res) => {
  var newData = req.body;
  var formData = {
    "id": 1027,
    "jsonrpc": "2.0",
    "method": "cards_getCards",
    "params": {
        "adddata": "",
        "frompos": 0,
        "limit": 31,
        "logindata": newData.token,
        "orderfield": "name|0",
        "qfilter": "",
        "qlabelfilter": "-1"
    }
  }
  var API_URL = 'http://15.197.225.88/epc/rpc.php';

  axios.post(API_URL, formData)
    .then(response => {
        console.log('Response:', response.data);
        res.json(response.data)
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
app.post("/api/customer/bio/explist", authenticateToken, (req, res) => {
  var newData = req.body;
  var formData = {
    "id": 1028,
    "jsonrpc": "2.0",
    "method": "exp_getExpList",
    "params": {
        "cardid": newData.id,
        "frompos": 0,
        "labelfilter": "-1",
        "limit": 27,
        "logindata": newData.b_token,
        "orderfield": "dt|1",
        "typefilter": -1,
        "ymdfilter": ""
    }
  }

  var API_URL = 'http://15.197.225.88/epc/rpc.php';

  axios.post(API_URL, formData)
    .then(response => {
        console.log('Response:', response.data);
        res.json(response.data)
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
app.post("/api/customer/bio/fullscan", authenticateToken, (req, res) => {
  var newData = req.body;

  var API_URL = `http://15.197.225.88/epc/expget.php?login=${newData.b_name}&pass=${md5(newData.b_password)}&expid=${newData.expID}`;

  axios.post(API_URL)
    .then(response => {
        console.log('Response:', response.data);        
        res.json(response.data)
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
app.post("/api/customer/bio/save", authenticateToken, (req, res) => {
  var newData = req.body;
  connection.query(
    "Select * FROM bio_data WHERE date = ? and customer_id = ?",
    [newData.date, newData.customer_id],
    (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        const updateQuery =
          "UPDATE bio_data SET data =? WHERE date =? and customer_id=?";
        const updateValues = [
          newData.data,
          newData.date, 
          newData.customer_id
        ]; // Replace with actual values
        connection.query(updateQuery, updateValues, (error, results, fields) => {
          if (error) throw error;
          console.log("Updated rows:", results.affectedRows);
          res.json(results.affectedRows);
        });
      } else {
        connection.query(
          "INSERT INTO bio_data (customer_id, date, data ) VALUES (?, ?, ?)",
          [
            newData.customer_id,
            newData.date,
            newData.data
          ],
          (error, results, fields) => {
            if (error) throw error;
            res.json(results.insertId);
          }
        );
      }
    }
  );
  // Update operation
});
app.post("/api/customer_new", authenticateToken, (req, res) => {
  var newData = req.body;
  const { userId } = req.user;
  connection.query(
    "Select * FROM customer_list WHERE email = ?",
    [newData.email],
    async (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json("duplicated");
      } else {
        var cryptedPass = await bcrypt.hash(newData.password, 10)
        var loginData = newData.b_password == '' ? '' : logindata(newData.b_username, newData.b_password);
        connection.query(
          "INSERT INTO customer_list (firstname, lastname, address, city, state, zipcode, country, email, phone, sex, password, practitioner, h_key, h_id, h_password, h_email, b_username, b_password, b_token, apis ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            newData.firstname,
            newData.lastname,
            newData.address,
            newData.city,
            newData.state,
            newData.zipcode,
            newData.country,
            newData.email,
            newData.phone,
            newData.sex,
            cryptedPass,
            userId,
            newData.h_key,
            newData.h_id,
            newData.h_password,
            newData.h_email,
            newData.b_username,
            newData.b_password,
            loginData,
            newData.apis
          ],
          (error, results, fields) => {
            if (error) throw error;
            console.log("Inserted a new row with ID:", results.insertId);
            res.json(results.insertId);
          }
        );
        
      }
    }
  );
});
app.post("/api/customer/remove", authenticateToken, (req, res) => {
  var newData = req.body;
  // Update operation
  connection.query(
    "DELETE FROM customer_list WHERE id = ?",
    [newData.id],
    (error, results, fields) => {
      if (error) throw error;
      console.log("Deleted rows:", results.affectedRows);
      res.json("success");
    }
  );
});

app.get("/api/user/customers", authenticateToken, (req, res) => {
  const { userId } = req.user;
  const query = "SELECT * FROM customer_list WHERE practitioner = ?;";
  connection.query(query, [userId], async (error, results, fields) => {
    if (error) throw error;

    user = results;

    res.json(user);
  });
  return;
});
app.post("/api/customer/update", authenticateToken, async (req, res) => {
  var newData = req.body;
  
  // Update operation
  var loginData = newData.b_password == '' ? '' : logindata(newData.b_username, newData.b_password);
  if(newData.password == '') {
    const updateQuery =
      "UPDATE customer_list SET firstname =?, lastname =?, address =?, city =?, zipcode =?, state =?, phone =?, email =?, country = ?, sex =?, h_key=?, h_id=?, h_email=?, h_password=?, h_token=?, b_username=?, b_password=?, b_token=?, apis=? WHERE id =?";
    const updateValues = [
      newData.firstname,
      newData.lastname,
      newData.address,
      newData.city,
      newData.zipcode,
      newData.state,
      newData.phone,
      newData.email,
      newData.country,
      newData.sex,
      newData.h_key,
      newData.h_id,
      newData.h_email,
      newData.h_password,
      newData.h_token,
      newData.b_username,
      newData.b_password,
      loginData,
      newData.apis,
      newData.id
    ]; // Replace with actual values
    connection.query(updateQuery, updateValues, (error, results, fields) => {
      if (error) throw error;
      console.log("Updated rows:", results.affectedRows);
      res.json(loginData);
    });
  } else {
    var cryptedPass = await bcrypt.hash(newData.password, 10)
    const updateQuery =
      "UPDATE customer_list SET firstname =?, lastname =?, address =?, city =?, zipcode =?, state =?, phone =?, email =?, country = ?, sex =?, password =?, h_key=?, h_id=?, h_email=?, h_password=?, h_token=?, b_username=?, b_password=?, b_token=?, apis=? WHERE id =?";
    const updateValues = [
      newData.firstname,
      newData.lastname,
      newData.address,
      newData.city,
      newData.zipcode,
      newData.state,
      newData.phone,
      newData.email,
      newData.country,
      newData.sex,
      cryptedPass,
      newData.h_key,
      newData.h_id,
      newData.h_email,
      newData.h_password,
      newData.h_token,
      newData.b_username,
      newData.b_password,
      loginData,
      newData.apis,
      newData.id
    ]; // Replace with actual values
    connection.query(updateQuery, updateValues, (error, results, fields) => {
      if (error) throw error;
      console.log("Updated rows:", results.affectedRows);
      res.json(loginData);
    });
  }

});

// Integrate API
app.post("/api/integrate/heart", authenticateToken, async (req, res) => {
  try {
    var newData = req.body;
    var code = '';
    
    // const driver = new webdriver.Builder().forBrowser("chrome").build();
    // // Instantiate a web browser page
    // await driver.navigate().to("https://heartcloud.com/oauth/authorize?response_type=code&client_id=gaia.t62stc3k899w2b4a3k5&scope=profile%20settings%20activity&state=i9z4d4315fFtoiuK7wP2b3A3b8npZv")
    // .then(() => driver.findElement(webdriver.By.id('email')).sendKeys(newData.h_email))
    // .then(() => driver.findElement(webdriver.By.id('password')).sendKeys(newData.h_password))
    // .then(() => driver.findElement(webdriver.By.className('allow-button')).click())
    // .then(() => driver.getCurrentUrl())
    // .then((url) => {
    //   const urlString = url;
    //   const codeIndex = urlString.indexOf('code=') + 5; // Find the index where 'code=' ends
    //   const ampersandIndex = urlString.indexOf('&', codeIndex); // Find the index of the next '&' after 'code='
    //   code = urlString.substring(codeIndex, ampersandIndex !== -1 ? ampersandIndex : urlString.length);
    // });
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
    
      await page.goto('https://heartcloud.com/oauth/authorize?response_type=code&client_id=gaia.t62stc3k899w2b4a3k5&scope=profile%20settings%20activity&state=i9z4d4315fFtoiuK7wP2b3A3b8npZv');
      await page.fill('#email', newData.h_email);
      await page.fill('#password', newData.h_password);
      await page.click('.allow-button');
    
      const url = page.url();
      const codeIndex = url.indexOf('code=') + 5;
      const ampersandIndex = url.indexOf('&', codeIndex);
      code = url.substring(codeIndex, ampersandIndex !== -1 ? ampersandIndex : url.length);
    
      console.log(code); // You can use the 'code' variable as needed
    
      await browser.close();

      var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic Z2FpYS50NjJzdGMzazg5OXcyYjRhM2s1OnNGWUVIZjQ3NDZGSjM4MzRoQlpkc2RrcWZoMjNrRWZIZA=='
      };
      // Define the API endpoint URL
      var apiUrl = `https://heartcloud.com/oauth/token`;
    
      var accessToken;
      // Make a GET request to the API
      await axios.post(apiUrl, {
        grant_type: 'authorization_code',
        code: code
      }, {headers: headers})
        .then(response => {
          accessToken = response.data.access_token;
          // Get the current date
          const now = new Date();
          // Calculate the date 20 days from now
          const after20Days = new Date(now);
          after20Days.setDate(now.getDate() + 20);
          const updateQuery = "UPDATE customer_list SET h_token = ?, h_token_expried = ? WHERE id = ?";
          const updateValues = [accessToken, after20Days, newData.id]; // Replace with actual values
          connection.query(updateQuery, updateValues, (error, results, fields) => {
            if (error) throw error;
            console.log("Updated rows:", results.affectedRows);
            res.json(accessToken);
          });
        })
        .catch(error => {
          res.json(`failed_${error.response.data.error_description}`);
        });
    })();
    // Send the response with the data
  } catch (error) {
    // Handle errors here
    console.log(error)
    res.status(500).json({ error: "An error occurred" });
  }
});
app.post("/api/api/heart", authenticateToken, async (req, res) => {
  var newData = req.body;
  var headers = {
    'Content-Type': 'application/json'
  };
  if(newData.type == 'latest') {
      param = {
          k: newData.key,
          t: newData.token,
          From: Math.floor(Date.now() / 1000 - 365 * 24 * 60 * 60),
          To: Math.floor(Date.now() / 1000)
      };
      apiUrl = `https://api.heartcloud.com/api/v1/me/data?access_token=${newData.token}`;
  } else if(newData.type == 'day') {
    const currentDate = new Date(newData.day);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month as it is zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}${month}${day}`;
    param = {
        k: newData.key,
        t: newData.token,
        d: formattedDate
    };
    apiUrl = `https://api.heartcloud.com/api/v1/me/day?access_token=${newData.token}`;
  } else if(newData.type == 'month') {
    param = {
      k: newData.key,
      t: newData.token,
      From: Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60),
      To: Math.floor(Date.now() / 1000)
    };
    apiUrl = `https://api.heartcloud.com/api/v1/me/data?access_token=${newData.token}`;
  } else if(newData.type == 'custom') {
    param = {
      k: newData.key,
      t: newData.token,
      From: Math.floor(new Date(newData.startDate) / 1000),
      To: Math.floor(new Date(newData.endDate) / 1000)
    };
    apiUrl = `https://api.heartcloud.com/api/v1/me/data?access_token=${newData.token}`;
  } else if(newData.type == 'week') {
    param = {
      k: newData.key,
      t: newData.token,
      From: Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60),
      To: Math.floor(Date.now() / 1000)
    };
    apiUrl = `https://api.heartcloud.com/api/v1/me/data?access_token=${newData.token}`;
  }

  // Make a GET request to the API
  await axios.post(apiUrl, param, { headers: headers })
      .then(response => {
          console.log('Data API Response:', response.data);
          res.json(response.data);
      })
      .catch(error => {
          console.error('Error fetching data from the API:', error);
          // res.json(error.response.data)
          console.log(error.response.status);
          if(error.response.status == 404) {
            res.json(error.response.data);
          }
          // res.json(error.response.data);
      });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage, dest: "src/" });
// Define the route to handle the file upload
app.post("/api/media", upload.single("image"), function (req, res, next) {
  // Send a response back to the frontend
  if (req.file) {
    res.send(req.file.filename);
  } else {
    res.status(400).send("File upload failed");
  }
});
app.use("/api/src", express.static(__dirname + "/src"));
app.use(async (req, res, next) => {
  const token = req.header("Authorization");
  if (token) {
    try {
      const [rows, fields] = await db.execute(
        "INSERT INTO tokens (token) VALUES (?)",
        [token]
      );
      console.log("Token saved to the database:", token);
    } catch (error) {
      console.error("Error saving token to the database:", error.message);
    }
  }
  next();
});
app.listen(3000, () => {
  console.log("Server started..");
});
