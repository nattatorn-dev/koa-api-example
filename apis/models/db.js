// In a real application configuration would be stored outside the application
exports.knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: '/tmp/mydb.sqlite'
  },
  useNullAsDefault: true
});
