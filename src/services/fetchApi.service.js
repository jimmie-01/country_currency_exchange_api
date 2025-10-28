import axios from 'axios';
import sequelize from '../config/db.js';
import Country from '../models/country.schema.js';


const COUNTRIES_API = process.env.COUNTRIES_API || 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = process.env.EXCHANGE_API || 'https://open.er-api.com/v6/latest/USD';

const randMultiplier = () => Math.floor(Math.random() * 1001) + 1000;

export const fetchExternalData = async () => {
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
    const error = new Error('External data source unavailable');
    error.details = details;
    error.isExternal = true;
    throw error;
  }
}

export const refreshAll = async () => {
  // Fetch External Data
  const { countries, exchange } = await fetchExternalData();

  // Validate Exchange Format
  if (!exchange || (exchange.result && exchange.result !== 'success' && !exchange.rates)) {
    const error = new Error('External data source unavailable');
    error.details = 'Could not fetch data from exchange API';
    error.isExternal = true;
    throw error;
  }
  const rates = exchange.rates || exchange;

  // Using Transaction and only commmit once all DB operations are prepared
  const transact = await sequelize.transaction();

  try {
    const now = new Date();

    // iterate countries
    for (const country of countries) {
      // required: name and population
      const name = (country.name || '').trim();
      const population = (typeof country.population === 'number') ? country.population : null;
      const capital = country.capital || null;
      const region = country.region || null;
      const flag_url = country.flag || null;
      let currency_code = null;
      let exchange_rate = null;
      let estimated_gdp = null;

      // currencies: array? take first.code if exists
      if (Array.isArray(country.currencies) && country.currencies.length > 0 && country.currencies[0] && country.currencies[0].code) {
        currency_code = country.currencies[0].code;
        // If rate exists for currency_code, get it
        if (rates && typeof rates[currency_code] !== 'undefined') {
          exchange_rate = Number(rates[currency_code]);
          // compute estimated_gdp population × random(1000–2000) ÷ exchange_rate
          const mult = randMultiplier();
          // avoid division by zero
          if (exchange_rate !== 0 && population != null) {
            estimated_gdp = (Number(population) * mult) / exchange_rate;
          } else {
            estimated_gdp = null;
          }
        } else {
          // currency_code not found in exchange rates
          exchange_rate = null;
          estimated_gdp = null;
        }
      } else {
        // currencies empty - per spec: currency_code=null, exchange_rate=null, estimated_gdp=0
        currency_code = null;
        exchange_rate = null;
        estimated_gdp = 0;
      }

      // Validation: name and population required. If missing, skip this country (but spec says name&population required - remote data should have them)
      if (!name || population == null) {
        // skip - do not throw; but continue
        continue;
      }

      // Upsert logic: case-insensitive match by name
      // Use findOne then update/insert
      const existing = await Country.findOne({
        where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), name.toLowerCase()),
        transaction: transact
      });

      const payload = {
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
        last_refreshed_at: now
      };

      if (existing) {
        await existing.update(payload, { transaction: t });
      } else {
        await Country.create(payload, { transaction: t });
      }
    }

    // commit
    await transact.commit();

    // return summary stats: total count and timestamp
    const total = await Country.count();
    return { total_countries: total, last_refreshed_at: new Date().toISOString() };
  } catch (err) {
    await transact.rollback();
    throw err;
  }
}