const express = require('express');
const usuario = require('./controladores/usuario');
const produtos = require('./controladores/produtos');
const verificaLogin = require('./filtros/verificaLogin');

const rotas = express();

//usuario
rotas.post('/usuario', usuario.cadastrar_usuario);
rotas.post('/login', usuario.login);

rotas.use(verificaLogin);

rotas.get('/usuario', usuario.detalhe_usuario);
rotas.put('/usuario',usuario.atualizar_usuario);

//produtos
rotas.get('/produtos',produtos.lista_produtos);
rotas.get('/produtos/:id', produtos.detalhe_produto);
rotas.post('/produtos', produtos.cadastrar_produto);
rotas.put('/produtos/:id', produtos.atualizar_produto);
rotas.delete('/produtos/:id', produtos.deletar_produto);


module.exports = rotas;