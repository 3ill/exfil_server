export default () => ({
  db: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME,
  },
  redis: {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
