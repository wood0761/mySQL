var mysql = require("mysql");
var inquirer = require("inquirer");
var consoletable = require("console.table");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "Localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "Password",
  database: "bamazon_DB"
});
// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected!\n");
});

displayProducts();

function displayProducts() {
  connection.query("SELECT * FROM products", function (err, result) {
    if (err) throw err;
    console.log("Welcome to Steve's Marketplace of wonderment and amaze!\n")
    console.table(result);
    questionPrompt();
  });
}

// function which prompts the user for item_ID and quantity
function questionPrompt() {
  connection.query("SELECT * FROM products", function (err, result) {
    if (err) throw err;

    inquirer
      .prompt([ 
        {
          name: "selectID",
          type: "input",
          message: "Select the ID of the item you would like to buy:",
          validate: function(value) {
           if (value > 0 && value <= result.length){
             return true;
           }
           return false;
          }
        },
        {
          name: "selectQuantity",
          type: "input",
          message: "How many units would you like to buy?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answer) {
        // subtract one from answer.selectID to have the correct item from the 'result' array
        var chosenItem = (answer.selectID - 1);
        // If insufficient stock, return to item selection
        if(result[chosenItem].stock_quantity < answer.selectQuantity){
          console.log("\nSorry, insufficient quantity in stock. Please select again:\n");
          questionPrompt();
        }
        else {
          var newQuantity = result[chosenItem].stock_quantity;
          newQuantity -= answer.selectQuantity;
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newQuantity
              },
              {
                ITEM_ID: (chosenItem + 1)
              }
            ],
            function (err){
              if (err) throw err;
              var total = (result[chosenItem].price * answer.selectQuantity).toFixed(2);           
              console.log("\nYour total is $" + total); 
              selectAgain();
            }
        );
        }
      });
    });
}

function selectAgain() {
  inquirer
  .prompt([ 
    {
      name: "continue",
      type: "input",
      message: "Continue? (Y/N): ",
    }
  ])
  .then(function(answer) {
    if (answer.continue.toUpperCase() != 'N'){
      displayProducts();
    }
  })
}
