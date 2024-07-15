// Cadastar Produtos
const {Router} = require ('express')
const {Pool} = require('pg')

const productsRoutes = new Router()

const conexao = new Pool ({
    host: 'localhost',
    port: 5432,
    user:'postgres',
    password: '153000',
    database:'Lab_commerce'
})

productsRoutes.post('/products', async (request, response)=> {
   
    try {
     const dados = request.body
 
     if(!dados.name || !dados.amount || !dados.color){
      return response.send("nome, quantidade e cor são campos obrigatórios")
     }
  
     await conexao.query (`
         INSERT INTO products 
         (
           name,
           amount,
           color,
           voltage,
           description,
           category_id
         )
         VALUES
         (
           $1,
           $2,
           $3,
           $4,
           $5,
           $6
         )
  
      `, [dados.name, dados.amount, dados.color, dados.voltage, dados.description, dados.category_id]);

  
      response.status(201).json({mensagem: 'Produto cadastrado com sucesso'})
 
    } catch {
      response.status(500).json({mensagem: 'Nao foi possível cadastrar o produto'})
    }
    
 })

//Listar todos Produtos 

productsRoutes.get("/products", async (request, response) => {
    try {
        const products = await conexao.query("SELECT * FROM products");
        response.status(200).json(products.rows);
    } catch (error) {
        console.error("Erro ao listar os produtos:", error.message); // Log detalhado do erro
        response.status(500).json({ mensagem: 'Nao foi possível listar os produtos' });
    }
});

//Listar com detalhes

productsRoutes.get("/products/:id", async (request, response) => {
    const { id } = request.params;

    try {
        

        const result = await conexao.query(
            `
            SELECT 
                p.id,
                p.name,
                p.amount,
                p.color,
                p.voltage,
                p.description,
                p.category_id,
                c.name AS category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return response.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        response.status(200).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ mensagem: 'Nao foi possível listar o produto' });
    }
});

 module.exports = productsRoutes;