import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import routes from './routes/routes.js';
import sequelize from './config/db.js';
import Country from './models/country.schema.js';

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

// routes
app.use('/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// start server after DB sync
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // create table if not exists
    await Country.sync(); // safe for existing tables
    console.log('DB synced');

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();