export default () => ({
  port: parseInt(process.env.SERVER_PORT, 10) || 4000,
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    database: process.env.POSTGRES_DB || 'nest_project',
    username: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
    synchronize: Boolean(process.env.SYNCHRONIZE) || true,
  },
  JWT_SECRET: process.env.JWT_SECRET || 'jwtSecret',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '24h',
});
