const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const keySecure = require('../keyMarket');

const verificaLogin = async (req, res, next)=>{
    const{ authorization } = req.headers;
    if(!authorization){
        return res.status(404).json({mensagem: "token não informado"})
    }

    try {
        const token = authorization.replace('Bearer', '').trim();
        const user = jwt.verify(token, keySecure)
       

        const query = 'select * from usuarios where id = $1'
        const { rows, rowCount } = await conexao.query(query, [user.id]);

        if(rowCount ===0){
            return res.status(404).json({mensagem:"Usuario não encontrado"})
        }
        const {senha, ...usuario} = rows[0];
        req.usuario = usuario;

        next();
    } catch (error) {
        res.status(401).json({message: "Para acessar este recurso um token de autenticação válido deve ser enviado."})
    }
};

module.exports = verificaLogin;