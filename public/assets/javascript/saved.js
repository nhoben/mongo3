/* global bootbox */
$(document).ready(function() {
    // get reference for article container div 
    var articleContainer = $(".article-container");
    // Add event listeners for dynamically generated 
    // pull notes, save and remove notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);
  
    // initPage kicks everything off when the page is loaded
    initPage();
  
    function initPage() {
      // Empty the article container and then run AJAX request for any saved headlines
      articleContainer.empty();
      $.get("/api/headlines?saved=true").then(function(data) {
        //render headlines to page if they are there 
        if (data && data.length) {
          renderArticles(data);
        } else {
          // if not say no articles here 
          renderEmpty();
        }
      });
    }
  
    function renderArticles(articles) {
      // handles appending HTML containing article data
      // array of JSON that contains possible articles in db
      var articleCards = [];
      // article JSON object passed to createCard function which return bootstrap with article in it 
      for (var i = 0; i < articles.length; i++) {
        articleCards.push(createCard(articles[i]));
      }
      // when all HTML for the articles stored in articleCards array,append to the container for the articlescards
      
      articleContainer.append(articleCards);
    }
  
    function createCard(article) {
      // takes a single JSON object for an article/headline
      // onstructs a jQuery element containing all of the formatted HTML for the article card 
  
      var card = $(
        [
          "<div class='card'>",
          "<div class='card-header'>",
          "<h3>",
          "<a class='article-link' target='_blank' href='" + article.url + "'>",
          article.headline,
          "</a>",
          "<a class='btn btn-danger delete'>",
          "Delete From Saved",
          "</a>",
          "<a class='btn btn-info notes'>Article Notes</a>",
          "</h3>",
          "</div>",
          "<div class='card-body'>",
          article.summary,
          "</div>",
          "</div>"
        ].join("")
      );
      // article id attached to jQuery element 

      card.data("_id", article._id);
      // return the constructed card jQuery element
      return card;
    }
  
    function renderEmpty() {
      // HTML rendered to the page explaining no articles here
    
      var emptyAlert = $(
        [
          "<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
          "</div>",
          "<div class='card'>",
          "<div class='card-header text-center'>",
          "<h3>Would You Like to Browse Available Articles?</h3>",
          "</div>",
          "<div class='card-body text-center'>",
          "<h4><a href='/'>Browse Articles</a></h4>",
          "</div>",
          "</div>"
        ].join("")
      );
      // data appended to the page
      articleContainer.append(emptyAlert);
    }
  
    function renderNotesList(data) {
      // handles rendering note list items to our notes modal
   
      // construct currentNote variable to temporarily store each note
      var notesToRender = [];
      var currentNote;
      if (!data.notes.length) {
        // If no notes here - just display a message explaining this
        currentNote = [
          "<li class='list-group-item'>",
          "No notes for this article yet.",
          "</li>"
        ].join("");
        notesToRender.push(currentNote);
      } else {
        // if there are notes then
        for (var i = 0; i < data.notes.length; i++) {
          // creates an li element to contain  noteText with a delete button
          currentNote = $(
            [
              "<li class='list-group-item note'>",
              data.notes[i].noteText,
              "<button class='btn btn-danger note-delete'>x</button>",
              "</li>"
            ].join("")
          );
          // note id is stored on delete button for access when trying to remove
          currentNote.children("button").data("_id", data.notes[i]._id);
          // Adding currentNote to the notesToRender array
          notesToRender.push(currentNote);
        }
      }
      // Now append the notesToRender to the note-container inside the note modal
      $(".note-container").append(notesToRender);
    }
  
    function handleArticleDelete() {
      // This function handles deleting articles/headlines
      // We grab the id of the article to delete from the card element the delete button sits inside
      var articleToDelete = $(this)
        .parents(".card")
        .data();
      // Using a delete method here just to be semantic since we are deleting an article/headline
      $.ajax({
        method: "DELETE",
        url: "/api/headlines/" + articleToDelete._id
      }).then(function(data) {
        // If this works out, run initPage again which will re-render our list of saved articles
        if (data.ok) {
          initPage();
        }
      });
    }
    function handleArticleNotes(event) {
      // This function handles opening the notes modal and displaying our notes
      // We grab the id of the article to get notes for from the card element the delete button sits inside
      var currentArticle = $(this)
        .parents(".card")
        .data();
      // Grab any notes with this headline/article id
      $.get("/api/notes/" + currentArticle._id).then(function(data) {
        // Constructing our initial HTML to add to the notes modal
        var modalText = [
          "<div class='container-fluid text-center'>",
          "<h4>Notes For Article: ",
          currentArticle._id,
          "</h4>",
          "<hr />",
          "<ul class='list-group note-container'>",
          "</ul>",
          "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
          "<button class='btn btn-success save'>Save Note</button>",
          "</div>"
        ].join("");
        // Adding the formatted HTML to the note modal
        bootbox.dialog({
          message: modalText,
          closeButton: true
        });
        var noteData = {
          _id: currentArticle._id,
          notes: data || []
        };
        // Adding some information about the article and article notes to the save button for easy access
        // When trying to add a new note
        $(".btn.save").data("article", noteData);
        // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
        renderNotesList(noteData);
      });
    }
  
    function handleNoteSave() {
      // handles what happens when a user tries to save a new note for an article
      // Setting a variable to hold some formatted data about our note that has typed note 
      var noteData;
      var newNote = $(".bootbox-body textarea")
        .val()
        .trim();
     
      if (newNote) {
        noteData = { _headlineId: $(this).data("article")._id, noteText: newNote };
        $.post("/api/notes", noteData).then(function() {
          // When complete, close the modal
          bootbox.hideAll();
        });
      }
    }
  
    function handleNoteDelete() {
      // handles the deletion of notes
      // takeid of the note to delete
      // store data on the delete button 
      var noteToDelete = $(this).data("_id");
      // Perform an DELETE request to "/api/notes/" with the id of the note deleted paramater
      $.ajax({
        url: "/api/notes/" + noteToDelete,
        method: "DELETE"
      }).then(function() {
        // hide modal once complete 
        bootbox.hideAll();
      });
    }
  });