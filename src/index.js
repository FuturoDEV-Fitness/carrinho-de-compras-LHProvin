const express = require('express');
const clientsRoutes = require('./routes/clients.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes'); // Certifique-se de que o caminho está correto

const app = express();
app.use(express.json());

app.use('/clients', clientsRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes); // Certifique-se de usar o prefixo correto

app.listen(3000, () => {
    console.log("Servidor online");
});

