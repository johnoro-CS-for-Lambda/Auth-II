const table = 'departments'

exports.up = knex => (
  knex.schema.createTable(table, t => {
    t.increments();
    t.string('department');
  })
);

exports.down = knex =>  knex.schema.dropTable(table);
