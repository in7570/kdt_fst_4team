const express = require('express');

const app = express();
app.use(express.json());

app.use(express.static(__dirname));
app.use(express.Router());

const userRouter = require('./routes/user');
app.use('/', userRouter);

app.listen(7777, () => {
  console.log(`Server is running at http://localhost:7777`);
});