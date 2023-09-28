const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "userDetails.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//If user_id is not present on DB, create a new user. Otherwise, save the data under the same user.

app.post("/register/", async (req, res) => {
  try {
    const { username, bankAccounts, bankName, branch } = req.body;

    const selectUserQuery = `SELECT * FROM bank_details WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      // User doesn't exits
      const createUserQuery = `
          INSERT INTO 
            bank_details (username,bank_accounts, bank_name, branch) 
          VALUES 
            (
              '${username}', 
              '${bankAccounts}',
              '${bankName}', 
              '${branch}'
            )`;
      await db.run(createUserQuery);
      res.send(`User created successfully`);
    } else {
      //If user already exists
      const sqlQuery = `update bank_details set bank_accounts='${bankAccounts}',bank_name='${bankName}',branch='${branch}'
   where username='${username}'`;
      await db.run(sqlQuery);
      res.status(200);
      res.send("user updated successfully");
    }
  } catch (error) {
    console.log(error.message);
  }
});

// Allow anonymous users to add and read all data.

app.get("/getDetails", async (req, res) => {
  const sqlQuery = `select * from bank_details`;
  const dbRes = await db.all(sqlQuery);
  res.send(dbRes);
});
