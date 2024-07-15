const { Router } = require('express');
const { Pool } = require('pg');

const ordersRoutes = new Router();

const conexao = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '153000',
    database: 'Lab_commerce'
});

// Rota para cadastrar um pedido com itens
ordersRoutes.post('/', async (request, response) => {
    const { client_id, total, address, observations, items } = request.body;

    if (!client_id || !total || !address || !items || items.length === 0) {
        return response.status(400).json({ mensagem: 'Campos obrigatórios: client_id, total, address, items' });
    }

    try {
        await conexao.query('BEGIN');

        // Verificar se todos os product_id existem na tabela products
        const productIds = items.map(item => item.product_id);
        console.log("Verificando os seguintes product_ids:", productIds);

        const productCheckQuery = 'SELECT id FROM products WHERE id = ANY($1)';
        const productCheckResult = await conexao.query(productCheckQuery, [productIds]);

        console.log("Resultado da verificação de produtos:", productCheckResult.rows);

        if (productCheckResult.rows.length !== productIds.length) {
            console.log("Produtos encontrados:", productCheckResult.rows.map(row => row.id));
            await conexao.query('ROLLBACK');
            return response.status(400).json({ mensagem: 'Um ou mais produtos não existem' });
        }

        // Inserir o pedido na tabela orders
        const orderResult = await conexao.query(
            `INSERT INTO orders (client_id, total, address, observations) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id`,
            [client_id, total, address, observations]
        );
        const orderId = orderResult.rows[0].id;

        // Inserir os itens do pedido na tabela orders_items
        for (const item of items) {
            const { product_id, amount, price } = item;
            await conexao.query(
                `INSERT INTO orders_items (order_id, product_id, amount, price) 
                 VALUES ($1, $2, $3, $4)`,
                [orderId, product_id, amount, price]
            );
        }

        await conexao.query('COMMIT');
        response.status(201).json({ mensagem: 'Pedido cadastrado com sucesso', order_id: orderId });

    } catch (error) {
        await conexao.query('ROLLBACK');
        console.error("Erro ao cadastrar o pedido:", error.message);
        response.status(500).json({ mensagem: 'Não foi possível cadastrar o pedido' });
    }
});

module.exports = ordersRoutes;

