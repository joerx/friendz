'use strict';

const app = require('./app');
const port = process.env.PORT || 3000;

// ensure we can ctrl-c when running in docker
process.on('SIGINT', () => {
    console.log('bye!');
    process.exit();
});

app.listen(port, () => {
    console.log(':'+port);
});
