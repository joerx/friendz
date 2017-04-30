
exports.up = (knex, Promise) => 
    knex.schema.createTable('friends', t => {
        t.uuid('id').primary();
        t.string('email').notNull();
        t.unique('email');
    })

exports.down = (knex, Promise) =>
    knex.schema.dropTable('friends')
