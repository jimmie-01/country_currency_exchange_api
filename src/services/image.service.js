import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';
import Country from '../models/country.schema.js';

const CACHE_DIR = path.join(process.cwd(), 'cache');
export const OUT_PATH = path.join(CACHE_DIR, 'summary.png');

export const generateSummaryImage = async () => {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  // gather stats
  const total = await Country.count();
  const top5 = await Country.findAll({
    where: { estimated_gdp: { [require('sequelize').Op.not]: null } },
    order: [['estimated_gdp', 'DESC']],
    limit: 5
  });

  const now = new Date().toISOString();

  // Create simple image
  const width = 1000;
  const height = 600;
  const image = new Jimp(width, height, 0xffffffff); // white background

  // load a font
  const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const fontNormal = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_14_BLACK);

  image.print(fontTitle, 20, 20, `Countries Summary`);
  image.print(fontNormal, 20, 70, `Total countries: ${total}`);
  image.print(fontSmall, 20, 100, `Last refreshed at: ${now}`);

  image.print(fontNormal, 20, 140, `Top 5 countries by estimated GDP:`);

  let y = 180;
  if (top5.length === 0) {
    image.print(fontSmall, 20, y, 'No estimated GDP data available');
  } else {
    for (let i = 0; i < top5.length; i++) {
      const country = top5[i];
      const gdp = (country.estimated_gdp === null || country.estimated_gdp === undefined) ? 'N/A' : Number(country.estimated_gdp).toLocaleString(undefined, { maximumFractionDigits: 2 });
      const line = `${i + 1}. ${country.name} — ${gdp}`;
      image.print(fontSmall, 20, y, line);
      y += 30;
    }
  }

  await image.writeAsync(OUT_PATH);
  return OUT_PATH;
}