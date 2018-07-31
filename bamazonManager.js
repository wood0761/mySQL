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
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected!\n");
});

questionPrompt();
// function which prompts the manager what they want to do
function questionPrompt() {
    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;

        inquirer
            .prompt([{
                name: "menu_options",
                type: "rawlist",
                message: "Menu Options:",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
            }, ])
            .then(function (answer) {
                switch (answer.menu_options) {
                    case "View Products for Sale":
                        displayProducts();
                        break;
                    case "View Low Inventory":
                        lowInventory();
                        break;
                    case "Add to Inventory":
                        addInventory();
                        break;
                    case "Add New Product":
                        addNewProduct();
                        break;
                }
            });
    });
}

function displayProducts() {
    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        console.table(result);
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        for (var i = 0; i < result.length; i++) {
            if (result[i].stock_quantity < 5) {
                console.log(result[i].product_name);
            }
        }
    });
}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        console.table(result);
        inquirer
            .prompt([
                {
                    name: "selectItem",
                    type: "input",
                    message: "Select the ID of the item for which you would like more invetory:",
                    validate: function (value) {
                        if (value > 0 && value <= result.length) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "inventoryIncrease",
                    type: "input",
                    message: "How may units to add: ",
                    validate: function (value) {
                        if (value > 0 && isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {
            var chosenItem = (answer.selectItem);
            var newQuantity = parseInt(result[chosenItem - 1].stock_quantity);
            newQuantity += parseInt(answer.inventoryIncrease);
            connection.query(
                "UPDATE products SET ? WHERE ?", [
                    {
                        stock_quantity: newQuantity
                    },
                    {
                        item_ID: chosenItem
                    }
                ],
                function (err) {
                    if (err) throw err;
                    connection.query("SELECT * FROM products", function (err, result) {
                        console.log("Quantity updated to " + result[chosenItem - 1].stock_quantity);
                    })
                }
            );
        });
    });
}

function addNewProduct () {
    inquirer
            .prompt([
                {
                    name: "productName",
                    type: "input",
                    message: "Enter product name: "
                },
                {
                    name: "departmentName",
                    type: "input",
                    message: "Enter department name: "
                },
                {
                    name: "price",
                    type: "input",
                    message: "Enter price: "
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "Enter stock quantity: "
                }
            ])
            .then(function (answer) {
                connection.query("INSERT INTO products SET ?", {
                    product_name: answer.productName,
                    product_department: answer.departmentName,
                    price: answer.price,
                    stock_quantity: answer.quantity
                }, function (err) {
                if (err) throw err;
                connection.query("SELECT * FROM products", function (err, result) {
                    if (err) throw err;
                    console.log("\n Inventory Updated!\n")
                    console.table(result);
                    questionPrompt();
                })
            }
        )  
    })
}