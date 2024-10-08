const express = require('express');
const app = express();
const PORT = 4001;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');


// Routs
const ProductsRouter = require("./Routes/ProductsRouter");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => { res.json("Home") });

// App Use
app.use(express.json());
app.use(cors());

app.use("/Products", ProductsRouter);

app.listen(PORT, (error) => {
	if (!error)
		console.log("Roxiler Server is Successfully Running,  and App is listening on port " + PORT);
	else
		console.log("Error occurred, server can't start", error);
}
);

