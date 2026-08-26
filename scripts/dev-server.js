const express = require('express');
const { require: tsxRequire } = require('tsx/cjs/api');

const app = express();
const port = Number(process.env.PORT || 3000);
const productsRouter = tsxRequire('../src/api/products.ts', __filename).default;

app.use(express.json());
app.use(productsRouter);

app.listen(port, () => {
  console.log(`dev server ${port}`);
});