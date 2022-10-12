const express = require("express");
require("./db/mongoose");
const studentRouter = require("./routers/student");
const teacherRouter = require("./routers/teacher");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(studentRouter);
app.use(teacherRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
