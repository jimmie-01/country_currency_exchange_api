import axios from 'axios';
import sequelize from ('../config/db.js');
import Country from ('../models/country.schema.js');

import { op } from 'sequelize';

const COUNTRIES_API = process.env.COUNTRIES_API || 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = process.env.EXCHANGE_API || 'https://open.er-api.com/v6/latest/USD';

const randMultiplier = () => Math.floor(Math.random() * 1001) + 1000;

const fetchExternalData = async function () {
	try {
    const [countriesResp, exchangeResp] = await Promise.all([
      axios.get(COUNTRIES_API, { timeout: 15000 }),
      axios.get(EXCHANGE_API, { timeout: 15000 })
    ]);
    return { countries: countriesResp.data, exchange: exchangeResp.data };
  } catch (err) {
    // identify which API failed
    let details = 'Unknown';
    if (err.config && err.config.url) {
      details = `Could not fetch data from ${err.config.url}`;
    }
    const e = new Error('External data source unavailable');
    e.details = details;
    e.isExternal = true;
    throw e;
  }
}

