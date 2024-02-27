const express = require("express");
const bodyParser = require("body-parser");

//const connection = require('./sqlConnection');
const validation = require("./validation");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "grocerydb",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  } else {
    console.log("Database connected");
  }
});

//Admin API's

//Add new grocery items to the system
app.post("/api/admin/grocery-items", validation.itemValidation, (req, res) => {
  try {
    const itemName = req.body.itemName;
    const price = req.body.price;
    const stock = req.body.stock;
    
    let sqlQuery = `insert into item (itemName,price,stock) values ('${itemName}',${price},${stock})`;

    connection.query(sqlQuery, function (error, data, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error in Fetching Data");
      } else {
        res.status(200).json({ msg: "Data inserted successfully." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in adding grocery item.");
  }
});

//View existing grocery items
app.get("/api/admin/grocery-items", (req, res) => {
  try {
    let sqlQuery = "select * from item";
    connection.query(sqlQuery, function (error, data, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error in Fetching Data");
      } else {
        res.status(200).json(data);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in Fetching Data");
  }
});

//Remove grocery items from the system
app.delete("/api/admin/grocery-items/:id", (req, res) => {
  try {
    let id = req.params.id;
    if (!id || isNaN(id)) {
      return res
        .status(406)
        .json({ errMsg: `Error in Item Data : ${error.message}` });
    }
    let sqlQuery = `delete from item where itemId = '${id}'`;
    connection.query(sqlQuery, function (error, data, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error in Deleting Data");
      } else {
        res.status(200).json(data);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in Deleting Data");
  }
});
//Update details (e.g., name, price) of existing grocery items
app.put("/api/admin/grocery-items/:id", validation.itemValidation,(req, res) => {
  try {
    let id = req.params.id;
    if (!id || isNaN(id)) {
      return res.status(406).json({ errMsg: `Item id should be number` });
    }
    const itemName = req.body.itemName;
    const price = req.body.price;
    const stock = req.body.stock;
    let sqlQuery = `update item set itemName = '${itemName}',price = ${price},stock = ${stock}  where itemId = '${id}'`;
    connection.query(sqlQuery, function (error, data, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error in Updating Data");
      } else {
        res.status(200).json(data);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in Updating Data");
  }
});

//Manage inventory levels of grocery items
app.patch("/api/admin/grocery-items/:id/stock", (req, res) => {
  try {
    let id = req.params.id;
    if (!id || isNaN(id)) {
      return res
        .status(406)
        .json({ errMsg: `Error in Item Data : ${error.message}` });
    }
    const stock = req.body.stock;
    let sqlQuery = `update item set stock = ${stock}  where itemId = '${id}'`;
    connection.query(sqlQuery, function (error, data, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error in Updating Data");
      } else {
        res.status(200).json(data);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in Updating Data");
  }
});

// User API's
// View the list of available grocery items
app.get("/api/user/grocery-items", (req, res) => {
  try {
    let sqlQuery = "select * from item where stock >0";
    connection.query(sqlQuery, function (error, data, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error in Fetching Data");
      } else {
        res.status(200).json(data);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in Fetching Data");
  }
});

// Ability to book multiple grocery items in a single order
app.post("/api/user/placeOrders", validation.orderItemsValidation, (req, res) => {
  try {
    const itemList = req.body.itemList;
    const orderId = req.body.orderId;
    for (let item of itemList) {
      let sqlQuery = `insert into orderItems (orderId,itemId,quantity) values (${orderId},${item.itemId},${item.quantity})`;

      connection.query(sqlQuery, function (error, data, fields) {
        if (error) {
          console.error(error);
          return res.status(500).send("Error in adding item in ");
        }
      });
    }
    res.status(200).json({ msg: "Data inserted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in adding grocery item.");
  }
});

// View multiple grocery items in a single order
app.get("/api/user/order/:id", (req, res) => {
    try {
      const id = req.params.id;
        let sqlQuery = `select * from orderitems where orderId = ${id}`;

        connection.query(sqlQuery, function (error, data, fields) {
            if (error) {
              console.error(error);
              res.status(500).send("Error in Fetching Data");
            } else {
              sqlQuery2 = 'select item.itemName, item.price, orderitems.quantity from orderitems join item on orderitems.itemId = item.itemId';
              connection.query(sqlQuery2, function (error, data, fields) {
                if (error) {
                  console.error(error);
                  res.status(500).send("Error in Fetching Data");
                } else {
                  res.status(200).json(data);
                }});
              
            }
          });
        } catch (error) {
          console.error(error);
          res.status(500).send("Error in Fetching Data");
        }
  });

app.all("*", (req, res) => {
  res.status(200).send("<h1>404 Page Not Found.</h1>");
});

app.listen(3000, () => {
  console.log("Server is listening at port number 3000");
});
