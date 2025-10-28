import Country from '../models/country.schema.js';
import { refreshAll } from '../services/fetchApi.service.js';
import { generateSummaryImage, OUT_PATH } from '../services/image.service.js';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';

// POST /countries/refresh
const refresh = async (req, res) => {
	try {
      const result = await refreshAll();

      // generate image
      try {
        await generateSummaryImage();
      } catch (imgErr) {
        // image generation failure should not fail the refresh according to spec, but we log it.
        console.error('Image generation failed', imgErr);
      }

      return res.status(200).json(result);
    } catch (err) {
      if (err.isExternal) {
        return res.status(503).json({ error: 'External data source unavailable', details: err.details || 'Could not fetch external API' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /countries
const list = async (req, res) => {
	try {
      const where = {};
      const { region, currency, sort } = req.query;
      if (region) where.region = region;
      if (currency) where.currency_code = currency;

      const order = [];
      if (sort === 'gdp_desc') order.push(['estimated_gdp', 'DESC']);
      if (sort === 'gdp_asc') order.push(['estimated_gdp', 'ASC']);

      const countries = await Country.findAll({ where, order });
      const result = countries.map(country => ({
        id: country.id,
        name: country.name,
        capital: country.capital,
        region: country.region,
        population: Number(country.population),
        currency_code: country.currency_code,
        exchange_rate: country.exchange_rate === null ? null : Number(country.exchange_rate),
        estimated_gdp: country.estimated_gdp === null ? null : Number(country.estimated_gdp),
        flag_url: country.flag_url,
        last_refreshed_at: country.last_refreshed_at ? new Date(country.last_refreshed_at).toISOString() : null
      }));

      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /countries/:name
const getOne = async (req, res) => {
	try {
      const name = req.params.name;
      const country = await Country.findOne({
        where: { name: { [Op.like]: name } } // fallback
      });

      // better to do case-insensitive
      let cn = country;
      if (!cn) {
        cn = await Country.findOne({
          where: require('sequelize').where(require('sequelize').fn('LOWER', require('sequelize').col('name')), name.toLowerCase())
        });
      }

      if (!cn) return res.status(404).json({ error: 'Country not found' });

      return res.json({
        id: cn.id,
        name: cn.name,
        capital: cn.capital,
        region: cn.region,
        population: Number(cn.population),
        currency_code: cn.currency_code,
        exchange_rate: cn.exchange_rate === null ? null : Number(cn.exchange_rate),
        estimated_gdp: cn.estimated_gdp === null ? null : Number(cn.estimated_gdp),
        flag_url: cn.flag_url,
        last_refreshed_at: cn.last_refreshed_at ? new Date(cn.last_refreshed_at).toISOString() : null
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /countries/image
const image = async (req, res) => {
	try {
      const pth = OUT_PATH;
	  console.log(pth);
      if (!fs.existsSync(pth)) {
        return res.status(404).json({ error: 'Summary image not found' });
      }
      return res.sendFile(path.resolve(pth));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
}

export default { refresh, list, getOne, image };