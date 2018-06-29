// scrape script


// Require axios and cheerio for scrapes
var axios = require("axios");
var cheerio = require("cheerio");

// scrape the NYTimes website
var scrape = function() {
  // Scrape the NYTimes website
  return axios.get("http://www.nytimes.com").then(function(res) {
    var $ = cheerio.load(res.data);
    //save info for the article in array
    var articles = [];

    // loop each element that has the theme summary class

    $(".theme-summary").each(function(i, element) {
 

      //group text of the this element and store it in variable
 
      var head = $(this)
        .children(".story-heading")
        .text()
        .trim();

      // Grab the URL of the article
      var url = $(this)
        .children(".story-heading")
        .children("a")
        .attr("href");

      // take children with the class of summary then take inner text
      // store this in summary variable
      var sum = $(this)
        .children(".summary")
        .text()
        .trim();

      // then do this
      if (head && sum && url) {
        // use regex and the trim function  clean headlines and summaries
   
        var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

        // initialize article to push to array

        var dataToAdd = {
          headline: headNeat,
          summary: sumNeat,
          url: url
        };

        articles.push(dataToAdd);
      }
    });
    return articles;
  });
};

// function export
module.exports = scrape;