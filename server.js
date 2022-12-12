const express = require("express");
const app = express();
var cors = require("cors");

app.use(cors());
app.use(express.json());

//setting the route
const bcRoute = require("./sendToBlockchain");
app.use("/bc", bcRoute);

app.listen(4000, () => console.log("Server started on port 4000"));
