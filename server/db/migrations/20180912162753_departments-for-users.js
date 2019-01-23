const table = 'departments-for-users';
const refs = [ 'user', 'department' ];

exports.up = knex => (
  knex.schema.createTable(table, t => {
    t.increments();
    for (let ref of refs) {
      t.integer(`${ref}_id`).references(`${ref}s.id`).notNullable();
    }
  })
);

exports.down = knex => knex.schema.dropTable(table);
