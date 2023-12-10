const createError = require("http-errors");
const express = require("express");
const xssClean = require("xss-clean");
const { serverPort } = require("./secret");
const userRouter = require("./routers/userRouter");

const connectDatabase = require("./config/database");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");

const app = express();

app.use(xssClean());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/seed", seedRouter);

// Client error handling
app.use((req, res, next) => {
  next(createError(404, "Router not found!"));
});

// Server error handling -- all the errors
app.use((err, req, res, next) => {
  return errorResponse(res, {
    statusCode: err.status,
    message: err.message,
  });
});

app.listen(serverPort, async () => {
  console.log(`server is running at http://localhost:${serverPort}`);
  await connectDatabase();
});
