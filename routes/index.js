var express = require("express");
var router = express.Router();
const fs = require("fs");

let id = 1;
// Load existing data from file (if any)
let data = {};
try {
  const fileData = fs.readFileSync("data.json", "utf8");
  data = JSON.parse(fileData);
  console.log(data);
} catch (err) {
  console.log("Error reading data file:", err);
}

// API endpoint to get all items in the cart
router.get('/api/cart', (req, res) => {
  // Return the cart items as a JSON response
  res.json(data.cart);
});

// checkout item
router.post("/api/checkout/:id", function (req, res, next) {
  const itemId = req.body.itemId;
  // Find the item in the data array
  const item = data.cart.find(item => item.id == itemId);

  if (item) {
    // Check if the item is already checked out
    if (item.checkedOut) {
      res.status(400).json({ error: 'Item is already checked out' });
    } else {
      // Update the item's checkedOut status
      const itemIndex = data.cart.findIndex(item => item.id == itemId);
      const removedItem = data.cart.splice(itemIndex, 1)[0];
      data.checkout.push(removedItem);

      // Save the updated data to the file
      fs.writeFile('data.json', JSON.stringify(data), (err) => {
        if (err) {
          console.log('Error writing data file:', err);
          res.sendStatus(500);
        } else {
          console.log('Item checked out successfully.');
          res.status(200).json(item);
        }
      });
    }
  } else {
    // Item not found in the data array
    res.status(404).json({ error: 'Item not found' });
  }
});

router.get("/api/checkout", function (req, res, next) {
  res.json(data.checkout);
});

// Delete the item to cart
router.post("/api/delete/:id", function (req, res, next) {
  const itemId = req.params.id;
  console.log(itemId);
  // Find the index of the item in the data array
  const itemIndex = data.cart.findIndex(item => item.id == itemId);
  console.log(itemIndex)
  if (itemIndex !== -1) {
    // Remove the item from the data array
    const removedItem = data.cart.splice(itemIndex, 1)[0];

    // Save the updated data to the file
    fs.writeFile('data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log('Error writing data file:', err);
        res.sendStatus(500);
      } else {
        console.log('Item removed successfully.');
        res.status(200).json(removedItem);
      }
    });
  } else {
    // Item not found in the data array
    res.status(404).json({ error: 'Item not found' });
  }
});

// Add the item to cart
router.post("/api/addItem", function (req, res, next) {
  let newData = req.body;
  newData.id = id;
  id = id + 1;
  console.log(newData);
  console.log(data);
  console.log(data.cart);

  // Add the new data to the existing dataset
  data.cart.push(newData);

  // Save the updated data to the file
  fs.writeFile("data.json", JSON.stringify(data), (err) => {
    if (err) {
      console.log("Error writing data file:", err);
    } else {
      console.log("Data saved successfully.");
    }
  });

  // Send a response to the client
  res.sendStatus(200);
});

router.post('/api/editItem', (req, res) => {
  const itemId = req.body.itemId;
  const newQuantity = req.body.quantity;

  // Perform the necessary logic to edit the item with the given ID
  // Update the quantity of the item in the cart
  const itemIndex = data.cart.findIndex(item => item.id == itemId);
  console.log(itemIndex)
  if (itemIndex !== -1) {
    // Remove the item from the data array
    const editItem = data.cart[itemIndex].quantity = newQuantity;

    // Save the updated data to the file
    fs.writeFile('data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log('Error writing data file:', err);
        res.sendStatus(500);
      } else {
        res.json({ message: 'Item quantity updated successfully' });
        res.status(200);
      }
    });
  } else {
    // Item not found in the data array
    res.status(404).json({ error: 'Item not found' });
  }
});

module.exports = router;
