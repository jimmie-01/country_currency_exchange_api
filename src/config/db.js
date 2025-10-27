import { Sequelize } from 'sequelize';

const {
	DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
} = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
	console.error('Missing Database config in .env');
	process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD || '', {
	host: DB_HOST,
	port: DB_PORT || 3306,
	dialect: 'mysql',
	logging: false
});

export default sequelize;
