const conexao = require('../conexao');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const keySecure = require('../keyMarket');



const cadastrar_usuario = async (req,res)=>{
    const {nome, email, senha, nome_loja} = req.body;

    if(!nome){
        return res.status(404).json({mensagem: "O campo nome é obrigatorio!"});
    }
    if(!email){
        return res.status(404).json({mensagem: "O campo email é obrigatorio!"});
    }
    if(!senha){
        return res.status(404).json({mensagem: "O campo senha é obrigatorio!"});
    }
    if(!nome_loja){
        return res.status(404).json({mensagem: "O campo nome_loja é obrigatorio!"});
    }

    try {
        const query = 'select * from usuarios where email = $1'
        const verificaEmail = await conexao.query(query,[email]);
        if(verificaEmail.rowCount > 0 ){
            return res.status(400).json({mensagem: "O email informado ja esta cadastrado"});
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const usuario = await conexao.query('insert into usuarios(nome, email, senha, nome_loja) values ($1,$2,$3,$4)',[nome, email, senhaHash, nome_loja]);
        if(usuario.rowCount === 0){
            return res.status(404).json({mensagem: "Não foi possivel cadastrar usuario"});
        }
        res.status(201).json();

    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }

};

const login = async (req,res)=>{
    const{email, senha} = req.body;
    if(!email){
        return res.status(404).json("O campo email é obrigatorio");
    }
    if(!senha){
        return res.status(404).json("O campo senha é obrigatorio");
    }
    try {
        const query = 'select * from usuarios where email = $1'
        const verificaEmail = await conexao.query(query,[email]);
        if(verificaEmail.rowCount === 0 ){
            return res.status(404).json({mensagem: "O email informado não existe"});
        };
        const usuario = verificaEmail.rows[0];

        const senhaVerificada = await bcrypt.compare(senha, usuario.senha);
        if(!senhaVerificada){
            return res.status(404).json({mensagem:"Usuário e/ou senha inválido(s)."});
        }

        const token = jwt.sign({id: usuario.id}, keySecure, {expiresIn:'1d'} );
        return res.status(200).json({token: token});
    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
};

const detalhe_usuario = async (req,res)=>{
    const{ usuario } = req

    try {
        const query = 'select * from usuarios where id = $1'
        const user = await conexao.query(query, [usuario.id]);
        if(user.rowCount === 0){
            return res.status(404).json({mensagem: "Usuario não encontrado"})
        }

        const {senha, ...dadosUsuario} = user.rows[0]

        return res.status(200).json(dadosUsuario)
    } catch (error) {
        return res.status(401).json({mensagem: error.message})
    }
};

const atualizar_usuario = async (req,res)=>{
    const{ usuario } = req  
    const{ nome, email, senha, nome_loja } = req.body;
    
    if(!nome){
        return res.status(404).json({mensagem: "O campo nome é obrigatorio!"});
    }
    if(!email){
        return res.status(404).json({mensagem: "O campo email é obrigatorio!"});
    }
    if(!senha){
        return res.status(404).json({mensagem: "O campo senha é obrigatorio!"});
    }
    if(!nome_loja){
        return res.status(404).json({mensagem: "O campo nome_loja é obrigatorio!"});
    }
    try {
        const query = 'select * from usuarios where email = $1 and id != $2'
        const verificaEmail = await conexao.query(query,[email, usuario.id]);
        if(verificaEmail.rowCount > 0 ){
            return res.status(400).json({mensagem: "O e-mail informado já está sendo utilizado por outro usuário."});
        }
        
        const senhaHash = await bcrypt.hash(senha, 10);
        const userQuery = 'update usuarios set nome = $1, email = $2, senha = $3, nome_loja = $4 where id = $5'
        const user = await conexao.query(userQuery, [nome, email, senhaHash, nome_loja, usuario.id]);
        if(user.rowCount === 0){
            return res.status(404).json({mensagem: "Não foi possivel cadastrar usuario"});
        }
        res.status(201).json();

    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
    
};

module.exports ={
    cadastrar_usuario,
    login,
    detalhe_usuario,
    atualizar_usuario
}