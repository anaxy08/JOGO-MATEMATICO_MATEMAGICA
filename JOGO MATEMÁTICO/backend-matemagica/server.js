// server.js - Servidor do Ranking da Aventura Matemática

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
// Porta 3000 para desenvolvimento. Para produção, idealmente use process.env.PORT.
const PORT = 3000;

// --- Middlewares ---
app.use(cors()); // Permite requisições do Front-end
app.use(express.json()); // Permite ler dados JSON do corpo da requisição (req.body)

// --- Configuração do MySQL ---
// ATENÇÃO: Verifique se estas credenciais estão corretas e se o MySQL está ativo.
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root', // Troque se a sua senha do root for diferente
    database: 'aventuramatematica',
    port: 3306 // Porta padrão do MySQL
};

// =======================================================
// ROTAS DA API
// =======================================================

// Rota de Boas-Vindas/Status (Resolve o erro "Cannot GET /")
app.get('/', (req, res) => {
    res.status(200).json({
        message: "API do Ranking da Aventura Matemática está online!",
        endpoints: ["GET /ranking", "POST /ranking"]
    });
});

// Rota 1: GET - Buscar o Ranking
app.get('/ranking', async (req, res) => {
    let connection; // Define a variável fora do try para garantir o fechamento
    try {
        connection = await mysql.createConnection(dbConfig);

        // Seleciona os top 10 ordenados por estrelas
        const [rows] = await connection.execute(
            'SELECT nome, estrelas, nivel FROM ranking ORDER BY estrelas DESC, data_registro ASC LIMIT 10'
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        res.status(500).json({ message: "Erro interno no servidor ao buscar ranking." });
    } finally {
        if (connection) connection.end(); // Fecha a conexão
    }
});

// Rota 2: POST - Salvar ou Atualizar o Resultado do Jogador
app.post('/ranking', async (req, res) => {
    const { nome, estrelas, nivel } = req.body;
    let connection;

    // Validação básica dos dados
    if (!nome || estrelas === undefined || !nivel) {
        return res.status(400).json({ message: "Dados incompletos (nome, estrelas ou nível ausentes)." });
    }

    try {
        connection = await mysql.createConnection(dbConfig);

        // 1. Busca se o jogador já existe
        const [existing] = await connection.execute(
            'SELECT estrelas FROM ranking WHERE nome = ?',
            [nome]
        );

        if (existing.length > 0) {
            // Jogador existe: Atualiza SE a nova pontuação for melhor
            const estrelasExistentes = existing[0].estrelas;

            if (estrelas > estrelasExistentes) {
                await connection.execute(
                    'UPDATE ranking SET estrelas = ?, nivel = ?, data_registro = NOW() WHERE nome = ?',
                    [estrelas, nivel, nome]
                );
                return res.status(200).json({ message: "Recorde atualizado com sucesso!" });
            } else {
                return res.status(200).json({ message: "Pontuação mantida (não foi um novo recorde)." });
            }
        } else {
            // Jogador novo: Insere
            await connection.execute(
                'INSERT INTO ranking (nome, estrelas, nivel) VALUES (?, ?, ?)',
                [nome, estrelas, nivel]
            );
            return res.status(201).json({ message: "Novo jogador inserido no ranking!" });
        }
    } catch (error) {
        console.error("Erro ao salvar resultado (MySQL):", error);
        res.status(500).json({ message: "Erro interno no servidor ao salvar resultado." });
    } finally {
        if (connection) connection.end(); // Fecha a conexão
    }
});

// =======================================================

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});