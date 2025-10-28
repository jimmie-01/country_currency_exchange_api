import Country from '../models/country.schema.js';

const status = async (req, res) => {
	try {
      const total = await Country.count();
      const last = await Country.findOne({ order: [['last_refreshed_at', 'DESC']] });
      return res.json({
        total_countries: total,
        last_refreshed_at: last && last.last_refreshed_at ? new Date(last.last_refreshed_at).toISOString() : null
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
};

export default { status };