var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
// var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();


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

const sanFranUrl = "https://sfbay.craigslist.org/search/apa?search_distance=10&postal=94105&max_price=" + price || 3500 + "&min_bedrooms=" + minBeds || 2 + "&max_bedrooms=" + maxBeds || 2 + "&availabilityMode=0&sale_date=all+dates";
const newYorkUrl = "https://newyork.craigslist.org/search/aap?search_distance=4&postal=10012%2C&max_price=" + price || 3500 + "&min_bedrooms=" + minBeds || 2 + "&max_bedrooms=" + maxBeds || 2 + "&availabilityMode=0&sale_date=all+dates";

var price = 0;
var minBeds = 0;
var maxBeds = 0;
// Routes

// A GET route for scraping the craigslist results
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
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

app.get("/scrape", function (req, res) {

axios.get(sanFranUrl).then(function (response) {
    var $ = cheerio.load(response.data);

    $("li.result-row").each(function (i, element) {

    var title = $(element).find("a.result-title").text();
    var link = $(element).find("a.result-image").attr("href");
    var price = $(element).find("span.result-price").text();
    var priceFixed = price.slice(price.length / 2);

    var result = {
        title: title,
        link: link,
        price: priceFixed
    };

    db.scrapedData.insert(result, function (err, data) {
        if (err) throw err;
    });

    });
});
res.json({ worked: true })
})
