const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const router = require("./routes");

app.use("/", router);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/assets", express.static("assets"));

app.listen(process.env.PORT || port, () => {
  console.log(`server started on http://localhost:${port}`);
});
