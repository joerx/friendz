
exports.up = (knex) => 
    knex.schema.createTable('friendships', t => {
        t.uuid('f1_id');
        t.uuid('f2_id');
        t.unique(['f1_id', 'f2_id']);
    })

exports.down = (knex) =>
    knex.schema.dropTable('friendships')
