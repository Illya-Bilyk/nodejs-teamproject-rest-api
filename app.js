const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();

const authRouter = require("./routes/api/auth");
const usersRouter = require("./routes/api/users");
const filtersRouter = require("./routes/api/filters");
const drinksRouter = require("./routes/api/drinks");

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/filters", filtersRouter);
app.use("/drinks", drinksRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;
