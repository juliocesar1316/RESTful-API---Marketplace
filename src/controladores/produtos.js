const conexao = require('../conexao');

const lista_produtos = async (req,res)=>{
    const{usuario} = req;
    const categoria = req.query.categoria
    try {
        if(categoria){
            const query = 'select * from produtos where usuario_id = $1 and categoria = $2';
            const listaProdutos = await conexao.query(query, [usuario.id, categoria]);
            return res.status(200).json(listaProdutos.rows)
        }
        else{
            const query = 'select * from produtos where usuario_id = $1';
            const listaProdutos = await conexao.query(query, [usuario.id]);
            return res.status(200).json(listaProdutos.rows)
        }
    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
};

const detalhe_produto = async (req,res)=>{
    const{usuario} = req;
    const {id} = req.params

    try {
        const verificaProduto = await conexao.query('select * from produtos where id = $1',[id]);
        if(verificaProduto.rowCount ===0){
            return res.status(404).json({mensagem: `Não existe produto cadastrado com ID ${id}.`})
        }

        const query = 'select * from produtos where usuario_id = $1 and id = $2';
        const detalheProduto = await conexao.query(query, [usuario.id, id]);
        if(detalheProduto.rowCount === 0){
            return res.status(403).json({mensagem:  "O usuário logado não tem permissão para acessar este produto."})
        }
        return res.status(200).json(detalheProduto.rows[0])
    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
};

const cadastrar_produto = async (req,res)=>{
    const {usuario} = req;
    const{nome, quantidade, categoria, preco, descricao, imagem} = req.body;
    if(!nome){
        return res.status(400).json({mensagem: "O campo nome é obrigatorio"})
    }
    if(!quantidade){
        return res.status(400).json({mensagem: "O campo quantidade é obrigatorio"})
    }
    if(!preco){
        return res.status(400).json({mensagem: "O preço do produto deve ser informado."})
    }
    if(!descricao){
        return res.status(400).json({mensagem: "O campo descricao é obrigatorio"})
    }
    if(quantidade <= 0){
        return res.status(400).json({mensagem: "A quantidade do produto tem que ser maior que 0"})
    }

    try {
        const query='insert into produtos(usuario_id, nome, quantidade, categoria, preco, descricao, imagem) values ($1,$2,$3,$4,$5,$6,$7)';
        const cadastrarProduto = await conexao.query(query, [usuario.id, nome, quantidade, categoria, preco, descricao, imagem]);
        if(cadastrarProduto.rowCount ===0){
            return res.status(400).json({mensagem: "Não foi possivel cadastrar o produto"});
        }
        return res.status(201).json()
    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
};

const atualizar_produto = async (req,res)=>{
    const{ usuario } = req
    const{id} = req.params  
    const{nome, quantidade, categoria, preco, descricao, imagem} = req.body;
    
    if(!nome){
        return res.status(404).json({mensagem: "O campo nome é obrigatorio!"});
    }
    if(!quantidade){
        return res.status(404).json({mensagem: "O campo quantidade é obrigatorio!"});
    }
    if(!preco){
        return res.status(404).json({mensagem: "O campo preco é obrigatorio!"});
    }
    if(!descricao){
        return res.status(404).json({mensagem: "O campo descricao é obrigatorio!"});
    }
    try {
        const verificaProduto = await conexao.query('select * from produtos where id = $1',[id]);
        if(verificaProduto.rowCount ===0){
            return res.status(404).json({mensagem: `Não existe produto cadastrado com ID ${id}.`})
        }
        
        const query = 'select * from produtos where usuario_id = $1 and id = $2';
        const detalheProduto = await conexao.query(query, [usuario.id, id]);
        if(detalheProduto.rowCount === 0){
            return res.status(403).json({mensagem:  "O usuário logado não tem permissão para acessar este produto."})
        }
        const queryAtualizar ='update produtos set nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 where id = $7';
        const atualizarProduto = await conexao.query(queryAtualizar, [nome, quantidade, categoria, preco, descricao, imagem, id]);
        if (atualizarProduto.rowCount === 0) {
            return res.status(400).json({mensagem:  "Não foi possivel atualizar os dados do produto"})
        }
        return res.status(201).json()

    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
};

const deletar_produto = async (req,res)=>{
    const{ usuario } = req
    const{id} = req.params  

    try {
        const verificaProduto = await conexao.query('select * from produtos where id = $1',[id]);
        if(verificaProduto.rowCount ===0){
            return res.status(404).json({mensagem: `Não existe produto cadastrado com ID ${id}.`})
        }
        const query = 'select * from produtos where usuario_id = $1 and id = $2';
        const detalheProduto = await conexao.query(query, [usuario.id, id]);
        if(detalheProduto.rowCount === 0){
            return res.status(403).json({mensagem:  "O usuário logado não tem permissão para acessar este produto."})
        }

        const deleteProduto = await conexao.query('delete from produtos where id = $1 and usuario_id = $2', [id, usuario.id]);
        if(deleteProduto.rowCount === 0){
            return res.status(403).json({mensagem:  "Não foi possivel deletar o produto"})
        }
        return res.status(204).json()
    } catch (error) {
        return res.status(400).json({mensagem: error.message})
    }
};

module.exports={
    lista_produtos,
    detalhe_produto,
    cadastrar_produto,
    atualizar_produto,
    deletar_produto
}