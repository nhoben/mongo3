/* global bootbox */
$(document).ready(function() {
    // Setting a reference to the article-container div 
    // Adding event listeners to save articles dynamically
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);
  
    // OWhen the page is ready -  run the initPage function to begin
    initPage();
  
    function initPage() {
      // Empty the article container, run an AJAX request for any unsaved headlines
      articleContainer.empty();
      $.get("/api/headlines?saved=false").then(function(data) {
        // If we have headlines, render them to the page
        if (data && data.length) {
          renderArticles(data);
        }
        else {
          // If not - then show a message with no articles
          renderEmpty();
        }
      });
    }
  
    function renderArticles(articles) {
      // handling appending HTML containing article data to the page
      // array of JSON with articles in db
      var articleCards = [];
      // pass json object to createCard
    
      for (var i = 0; i < articles.length; i++) {
        articleCards.push(createCard(articles[i]));
      }
      // when html for articles is stored in array - append to articleCards container
     
      articleContainer.append(articleCards);
    }
  
    function createCard(article) {
      // single JSON object for articles and headlines
      // jQuery element is contructed that has proper formatted HTML for article card
  
      var card = $(
        [
          "<div class='card'>",
          "<div class='card-header'>",
          "<h3>",
          "<a class='article-link' target='_blank' href='" + article.url + "'>",
          article.headline,
          "</a>",
          "<a class='btn btn-success save'>",
          "Save Article",
          "</a>",
          "</h3>",
          "</div>",
          "<div class='card-body'>",
          article.summary,
          "</div>",
          "</div>"
        ].join("")
      );
      // We attach the article's id to the jQuery element
      // We will use this when trying to figure out which article the user wants to save
      card.data("_id", article._id);
      // We return the constructed card jQuery element
      return card;
    }
  
    function renderEmpty() {
      // HTML renders on the page explaining no articles here to see 
      
      var emptyAlert = $(
        [
          "<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
          "</div>",
          "<div class='card'>",
          "<div class='card-header text-center'>",
          "<h3>What Would You Like To Do?</h3>",
          "</div>",
          "<div class='card-body text-center'>",
          "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
          "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
          "</div>",
          "</div>"
        ].join("")
      );
      // Appending this data to the page
      articleContainer.append(emptyAlert);
    }
  
    function handleArticleSave() {
      // function when user wants to save an article
      // When we rendered the article initially, attach js object w/ headline id and get it 
 
      var articleToSave = $(this)
        .parents(".card")
        .data();
      articleToSave.saved = true;
      // use patch to be semantic 
      $.ajax({
        method: "PUT",
        url: "/api/headlines/" + articleToSave._id,
        data: articleToSave
      }).then(function(data) {
        // If data was saved
        if (data.saved) {
          // Run the initPage function again and reload article list 
          initPage();
        }
      });
    }
  
    function handleArticleScrape() {
      // handles clicking any "scrape new article" buttons
      $.get("/api/fetch").then(function(data) {
        // If we are able to successfully scrape the NYTIMES and compare the articles to those
        // already in our collection, re render the articles on the page - save articles for user message
   
        initPage();
        bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
      });
    }
  });