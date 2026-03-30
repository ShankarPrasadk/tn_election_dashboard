import app from './app.mjs';

const port = Number(process.env.PORT || 8787);

app.listen(port, () => {
  console.log(`Election API listening on http://localhost:${port}`);
});