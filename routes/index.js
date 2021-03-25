// const { render } = require("ejs");
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/:name", (req, res) => {
  const name = req.params.name;
  res.render("token", { name });
});

module.exports = router;
