import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello from Zafir backend!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
