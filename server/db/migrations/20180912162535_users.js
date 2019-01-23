const table = 'users';

exports.up = knex => (
  knex.schema.createTable(table, t => {
    t.increments();
    t.string('name').notNullable().unique();
    t.string('pass').notNullable();
  })
);

exports.down = knex =>  knex.schema.dropTable(table);
