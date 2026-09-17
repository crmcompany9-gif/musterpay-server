require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ service: 'MusterPay API', ok: true }));
app.use('/api', routes);

// central error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`MusterPay API on http://localhost:${PORT}`)))
  .catch((err) => { console.error('DB connection failed:', err.message); process.exit(1); });
