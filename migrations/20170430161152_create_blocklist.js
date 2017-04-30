
exports.up = (knex) => 
    knex.schema.createTable('blocklist', t => {
        t.uuid('id').primary();
        t.uuid('requestor');
        t.string('target');
        t.unique(['requestor', 'target']);
    })

exports.down = (knex) =>
    knex.schema.dropTable('blocklist')
