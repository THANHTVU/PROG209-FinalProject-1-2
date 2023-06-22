$(document).on("pagecreate", function () {
  // JavaScript for background effect
  var canvas = document.createElement("canvas");
  canvas.id = "background-effect";
  document.body.appendChild(canvas);

  var c = canvas.getContext("2d");
  var w = (canvas.width = window.innerWidth);
  var h = (canvas.height = window.innerHeight);

  var chars = "01";
  chars = chars.split("");

  var fontSize = 14;
  var columns = w / fontSize;

  var drops = [];

  for (var i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  function draw() {
    c.fillStyle = "rgba(0, 0, 0, 0.05)";
    c.fillRect(0, 0, w, h);

    c.fillStyle = "#0F0"; // Set your desired text color
    c.font = fontSize + "px arial";

    for (var i = 0; i < drops.length; i++) {
      var text = chars[Math.floor(Math.random() * chars.length)];
      c.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > h && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  setInterval(draw, 33);
});

$(document).on("click", ".add-to-cart-button", function (e) {
  e.preventDefault();

  // Get the product details from the clicked button's parent page
  var productPage = $(this).closest('[data-role="page"]');
  var productName = productPage.find("h2").text();
  var productPrice = productPage.find("h3").text();

  // Create the item object
  var item = {
    name: productName,
    price: productPrice,
    quantity: 1,
  };

  // Send the item to the server using the API endpoint
  $.ajax({
    url: 'api/addItem',
    method: 'POST',
    data: item,
    success: function(response) {
      console.log('Item added successfully:', response);
      // Handle success response, if needed
    },
    error: function(xhr, status, error) {
      console.log('Error adding item:', error);
      // Handle error response, if needed
    }
  });

  $.mobile.changePage("#cart-summary", { transition: "slide" });
});

$(document).on('pagebeforeshow', '#cart-summary', function() {
  // Get the cart items from the server using the API endpoint
  getCartItemsFromServer();
});

function getCartItemsFromServer() {
  // Make an AJAX GET request to the API endpoint to retrieve cart items
  $.ajax({
    url: 'api/cart',
    method: 'GET',
    success: function(response) {
      // Handle the success response and display the cart items
      console.log(response);
      displayCartItems(response);
    },
    error: function(xhr, status, error) {
      console.log('Error retrieving cart items:', error);
      // Handle the error response, if needed
    }
  });
}

function displayCartItems(items) {
  // Clear the existing cart item list
  $('#cart-items').empty();
  
  // Loop through the items and create list items for each item
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    
    // Create a list item with the item details
    var listItem = $('<li>').addClass('listGroup');
    var leftSide = $('<div>');
    var rightSide = $('<li>');
    var id = $('<h2>').addClass('item-id').text(item.id);
    var itemName = $('<h3>').text(item.name);
    var itemPrice = $('<p>').text('Price: ' + item.price);
    var itemQuantity = $('<p>').text('Quantity:' + item.quantity);
    
    // Add delete and edit buttons for each item
    var deleteButton = $('<a>').attr({
      href: '#',
      'data-role': 'button',
      'data-icon': 'delete',
      'data-iconpos': 'notext',
      'data-inline': 'true',
      class: 'delete-item ui-btn ui-icon-delete ui-btn-icon-notext'
    });
    
    var editButton = $('<a>').attr({
      href: '#',
      'data-role': 'button',
      'data-icon': 'edit',
      'data-iconpos': 'notext',
      'data-inline': 'true',
      class: 'edit-item ui-btn ui-icon-edit ui-btn-icon-notext'
    });

    var checkoutButton = $('<a>').attr({
      href: '#',
      'data-role': 'button',
      'data-iconpos': 'notext',
      'data-inline': 'true',
      class: 'checkout-item ui-btn ui-icon-check ui-btn-icon-notext'
    });
    
    // Append the item details and buttons to the list item
    leftSide.append(itemName, itemPrice, itemQuantity, id);
    rightSide.append(deleteButton, editButton, checkoutButton);
    listItem.append(leftSide, rightSide);
    // Append the list item to the cart items listview
    $('#cart-items').append(listItem);
  }
  
  // Refresh the cart items listview to enhance the styling
  $('#cart-items').listview('refresh');
}

$(document).on('click', '.delete-item', function() {
  var itemId = $(this).closest('.listGroup').find('.item-id').text();
  // Use the itemId as needed
  console.log(itemId);
  // Make an AJAX request to the delete item endpoint
  $.ajax({
    url: '/api/delete/' + itemId,
    method: 'POST',
    data: { itemId: itemId },
    success: function(response) {
      // Handle the success response
      console.log('Item deleted successfully');
      
      // Optionally, you can remove the deleted item from the UI
      // Refresh the current page
      var currentPage = $.mobile.pageContainer.pagecontainer('getActivePage');
      $.mobile.pageContainer.pagecontainer('change', currentPage, {
        allowSamePageTransition: true,
        transition: 'none',
        reload: true
      });

    },
    error: function(xhr, status, error) {
      // Handle the error response
      console.error('Error deleting item:', error);
    }
  });
});

// Handle click events on edit buttons
$(document).on('click', '.edit-item', function() {
  // Get the item ID from the closest list item
  var itemId = $(this).closest('.listGroup').find('.item-id').text();
  console.log(itemId);
  // Prompt the user to enter the new quantity
  var newQuantity = prompt('Enter the new quantity:');
  
  // Validate the input
  if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
    // Call the edit item API endpoint with the new quantity
    $.ajax({
      url: '/api/editItem',
      method: 'POST',
      data: {
        itemId: itemId,
        quantity: newQuantity
      },
      success: function(response) {
        // Handle the success response
        alert('Item quantity updated successfully!');
        
        // Refresh the screen to reflect the updated quantity
        var currentPage = $.mobile.pageContainer.pagecontainer('getActivePage');
      $.mobile.pageContainer.pagecontainer('change', currentPage, {
        allowSamePageTransition: true,
        transition: 'none',
        reload: true
      });
      },
      error: function(xhr, status, error) {
        // Handle the error response
        alert('Failed to update item quantity. Error: ' + error);
      }
    });
  } else {
    alert('Invalid quantity. Please enter a valid number.');
  }
});

$(document).on('click', '.checkout-item', function(e) {
  e.preventDefault();

  // Get the item ID from the data attribute of the parent list item
  var itemId = $(this).closest('.listGroup').find('.item-id').text();

  // Make an AJAX request to the checkout item endpoint
  $.ajax({
    url: '/api/checkout/' + itemId,
    method: 'POST',
    data: { itemId: itemId },
    success: function(response) {
      // Handle the success response from the server
      console.log('Item checkout successful');
      // Refresh the cart items or perform any other necessary action
      $.mobile.changePage("#checkout", { transition: "slide" });
    },
    error: function(xhr, status, error) {
      // Handle the error response from the server
      console.error('Error checking out item:', error);
    }
  });
});

$(document).on('pagebeforeshow', '#checkout', function() {
  $.ajax({
    url: 'api/checkout',
    method: 'GET',
    success: function(item) {
      // Handle the success response and display the cart items
      console.log(item);
      var listItem = $('<div>');
    var itemName = $('<h3>').text(item[0].name);
    var itemPrice = $('<p>').text('Price: ' + item[0].price);
    var itemQuantity = $('<p>').text('Quantity:' + item[0].quantity);
    listItem.append(itemName, itemPrice, itemQuantity);
    $('#checkout-display').append(listItem);
    },
    error: function(xhr, status, error) {
      console.log('Error retrieving cart items:', error);
      // Handle the error response, if needed
    }
  });
});
