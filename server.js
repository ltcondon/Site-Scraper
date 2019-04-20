
// ========================  
//   == Req. Packages ==
// ========================

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
    var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/craigslistDB";

    mongoose.connect(MONGODB_URI,  { useNewUrlParser: true });


// ========================  
//  == Helper Variables ==
// ========================


    // let price = 0;
    // let minBeds = 0;
    // let maxBeds = 0;

    // const sanFranUrl = "https://sfbay.craigslist.org/search/apa?search_distance=10&postal=94105&max_price=" + price || 3500 + "&min_bedrooms=" + minBeds || 2 + "&max_bedrooms=" + maxBeds || 2 + "&availabilityMode=0&sale_date=all+dates";
    const newYorkUrl = "https://newyork.craigslist.org/search/mnh/aap?max_price=4000&min_bedrooms=2&max_bedrooms=2&availabilityMode=0&sale_date=all+dates";



// ========================  
//   ===== Routes =====
// ========================


    // Render home page on load

    app.get("/", (req, res) => res.render("index"));

    // A GET route for scraping the craigslist results:

    app.get('/scrape', (req, res) => {
        
        axios.get(newYorkUrl).then(function(response) {

            const $ = cheerio.load(response.data);
            const promises = $('li.result-row')

                .get() // as in jQuery, .get() unwraps Cheerio and returns Array
                .map(function(element) { // this is Array.prototype.map()

                var price = $(element).find("span.result-price").text();
                var priceFixed = price.slice(price.length / 2);
                var bedrooms = $(element).find("span.housing").text().trim() === '' ? $(element).find("span.housing").text().trim() : 'None Listed';
                var location = $(element).find("span.result-hood").text().trim() === '' ? $(element).find("span.result-hood").text().trim() : 'Not Specified'
            
                return db.Listing.create({
                    image: $(element).find("img"),
                    title: $(element).find("a.result-title").text().trim(),
                    link: $(element).find("a.result-image").attr("href").trim(),
                    price: priceFixed,
                    location: $(element).find("span.result-hood").text().trim(),
                    bedrooms: $(element).find("span.housing").text().trim()
                })

                .catch(err => { // catch so any one failure doesn't scupper the whole scrape.
                    return {}; // on failure of Listing.create(), inject some kind of default object (or string or whatever).
                });
            });
            
            // At this point, we have an array of promises, which need to be aggregated with Promise.all().
            Promise.all(promises)
            
            .then(results => { // Promise.all() should accept whatever promises are returned by Listing.create().
            
                console.log(results);
                res.json(results);

            });
        });
    });

// ========================  
//   === Start Server ===
// ========================

    app.listen(PORT, function() {
        console.log("App running on port " + PORT + "!");
    });
