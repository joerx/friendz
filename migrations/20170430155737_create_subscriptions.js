
exports.up = (knex) => 
    knex.schema.createTable('subscriptions', t => {
        t.uuid('id').primary();
        t.uuid('target');
        t.string('subscriber');
        t.unique(['target', 'subscriber']);
    })

exports.down = (knex) =>
    knex.schema.dropTable('subscriptions')
