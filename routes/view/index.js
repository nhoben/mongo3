
//require express
var router = require("express").Router();

// renders homepage
router.get("/", function(req, res) {
  res.render("home");
});

// renders saved handledbars page
router.get("/saved", function(req, res) {
  res.render("saved");
});

module.exports = router;