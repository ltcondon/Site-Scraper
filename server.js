const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

// Our scraping tools

const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();

// Require and set Handlebars engine
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI,  { useNewUrlParser: true });

let price = 0;
let minBeds = 0;
let maxBeds = 0;

const sanFranUrl = "https://sfbay.craigslist.org/search/apa?search_distance=10&postal=94105&max_price=" + price || 3500 + "&min_bedrooms=" + minBeds || 2 + "&max_bedrooms=" + maxBeds || 2 + "&availabilityMode=0&sale_date=all+dates";
const newYorkUrl = "https://newyork.craigslist.org/search/aap?search_distance=4&postal=10012%2C&max_price=" + price || 3500 + "&min_bedrooms=" + minBeds || 2 + "&max_bedrooms=" + maxBeds || 2 + "&availabilityMode=0&sale_date=all+dates";


// Routes

// Render home page on load
app.get("/", (req, res) => res.render("index"));


// A GET route for scraping the craigslist results

app.get("/scrape/:url", function(req, res) {
    
    // First, we grab the correct url to query:
  let url = req.params.url === "sanfran" ? sanFranUrl : newYorkUrl;
  
    // First, we grab the body of the html with axios
  axios.get(url).then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $("li.result-row").each(function (i, element) {

    var price = $(element).find("span.result-price").text();
    var priceFixed = price.slice(price.length / 2);

    var result = {
        image: $(element).find("img").attr("src").trim(),
        title: $(element).find("a.result-title").text().trim(),
        link: $(element).find("a.result-image").attr("href").trim(),
        price: $(element).find("span.result-price").text().trim(),
        location: $(element).find("span.result-hood").text().trim(),
        bedrooms: $(element).find("span.housing").text().trim(), 
    };

      db.Listing.create(result)
        .then(function(dbListing) {
          // View the added result in the console
          console.log(dbListing);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
