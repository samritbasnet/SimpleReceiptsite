const express = require("express");
const app = express();
const PORT = 4000;

const { check, validationResult } = require("express-validator");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

// Route to render the initial form
app.get("/", (req, res) => {
  res.render("index", { errors: null, receiptData: null });
});

// Route to process form submission
app.post(
  "/process",
  [
    // Validation checks for form fields
    check("name", "Must have a name").notEmpty(),
    check("address", "Must have an address").notEmpty(),
    check("city", "Must have a city").notEmpty(),
    check("province", "Please Enter province").notEmpty(),
    check("phone", "Should enter ten-digit number").isMobilePhone(),
    check("email", "Must have a valid email").isEmail(),
  ],
  function (req, res) {
    // Validate form data
    const errors = validationResult(req);
    console.log("form data: ", req.body);
    console.log("errors", errors);

    // If there are validation errors, render the form with errors
    if (!errors.isEmpty()) {
      res.render("index", {
        errors: errors.array(),
        receiptData: null,
      });
    } else {
      // Process the form data and generate a receipt
      let name = req.body.name;
      let address = req.body.address;
      let province = req.body.province;
      let city = req.body.city;
      const phone = req.body.phone;
      const email = req.body.email;

      const products = [];

      // Check for selected products and add them to the products array
      if (req.body.product1) {
        products.push({
          name: "Gopro-7 ",
          price: 720,
          quantity: parseFloat(req.body.product1),
        });
      }
      if (req.body.product2) {
        products.push({
          name: "Macbook-Pro",
          price: 1548,
          quantity: parseFloat(req.body.product2),
        });
      }
      if (req.body.product3) {
        products.push({
          name: "Apple Watch",
          price: 988,
          quantity: parseFloat(req.body.product3),
        });
      }
      if (req.body.product4) {
        products.push({
          name: "Pen",
          price: 8,
          quantity: parseFloat(req.body.product4),
        });
      }

      // Calculate total price
      const totalPrice = products.reduce((total, product) => {
        return total + product.price * product.quantity;
      }, 0);

      // Check if the total price is $10 or more
      if (totalPrice < 10) {
        return res.render("index", {
          errors: [{ msg: "Minimum purchase should be $10." }],
        });
      }

      // Sales tax calculation based on province (assumed tax rates)
      const taxRates = {
        ontario: 0.13,
        quebec: 0.14,
        alberta: 0.05,

        // Add more provinces as needed
      };

      const salesTax = taxRates[province] || 0;
      const totalWithTax = totalPrice + totalPrice * salesTax;

      console.log("name: ", name);

      // Receipt data to be rendered in the receipt view
      const receiptData = {
        name,
        address,
        city,
        province,
        phone,
        email,
        products,
        totalPrice: totalPrice.toFixed(2),
        salesTax: (salesTax * 100).toFixed(2),
        totalWithTax: totalWithTax.toFixed(2),
      };
      console.log(receiptData);

      // Render the "receipt" view with the receiptData
      res.render("receipt", { receiptData });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
