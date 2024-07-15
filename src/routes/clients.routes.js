//Cadastrar Clientes
const {Router} = require ('express')
const {Pool} = require('pg')

const clientsRoutes = new Router()

const conexao = new Pool ({
    host: 'localhost',
    port: 5432,
    user:'postgres',
    password: '153000',
    database:'Lab_commerce'
})


clientsRoutes.post('/clients', async (request, response)=> {
   
    try {
     const dados = request.body
 
     if(!dados.name || !dados.email || !dados.cpf || !dados.contact){
      return response.send("Todos os campos são obrigatórios")
     }
  
     await conexao.query (`
         INSERT INTO clients 
         (
           name,
           email,
           cpf,
           contact
         )
         VALUES
         (
           $1,
           $2,
           $3,
           $4
         )
  
      `, [dados.name, dados.email, dados.cpf, dados.contact]);

  
      response.status(201).json({mensagem: 'Cliente cadastrado com sucesso'})
 
    } catch {
      response.status(500).json({mensagem: 'Nao foi possível cadastrar o cliente'})
    }
    
 })

 module.exports = clientsRoutes