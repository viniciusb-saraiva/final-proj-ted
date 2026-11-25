const express = require("express");
const cors = require("cors");
const db = require("./database/db");
const app = express();
app.use(express.json());

app.use(cors());

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Servidor da API ETISC está rodando!");
});

app.get("/empresas", (req, res) => {
  // Retorna apenas dados públicos (CNPJ e Nome), jamais a senha.
  db.all("SELECT cnpj, nome FROM empresas ORDER BY nome", [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({
          message: "Erro ao buscar lista de empresas.",
          error: err.message,
        });
    }
    return res.status(200).json(rows);
  });
});

app.post("/empresas/cadastro", (req, res) => {
  const { nome, cnpj, senha } = req.body;

  if (!nome || !cnpj || !senha) {
    return res
      .status(400)
      .json({ message: "Campos 'nome', 'cnpj' e 'senha' são obrigatórios." });
  }

  if (senha.length < 6) {
    return res
      .status(400)
      .json({ message: "A senha deve ter no mínimo 6 caracteres." });
  }

  db.run(
    "INSERT INTO empresas (cnpj, nome, senha) VALUES (?, ?, ?)",
    [cnpj, nome, senha],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed: empresas.cnpj")) {
          return res
            .status(409)
            .json({ message: "Erro: Este CNPJ já está cadastrado." });
        }
        return res
          .status(500)
          .json({ message: "Erro ao cadastrar empresa.", error: err.message });
      }
      return res
        .status(201)
        .json({ message: "Cadastro realizado com sucesso!" });
    }
  );
});

app.post("/empresas/login", (req, res) => {
  const { cnpj, senha } = req.body;

  if (!cnpj || !senha) {
    return res.status(400).json({ message: "CNPJ e Senha são obrigatórios." });
  }

  db.get(
    "SELECT cnpj, nome, senha FROM empresas WHERE cnpj = ?",
    [cnpj],
    (err, empresa) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erro ao buscar empresa.", error: err.message });
      }

      if (!empresa || empresa.senha !== senha) {
        return res
          .status(401)
          .json({ message: "Erro: CNPJ ou Senha incorreta." });
      }

      const loggedCompany = {
        cnpj: empresa.cnpj,
        nome: empresa.nome,
      };

      return res
        .status(200)
        .json({
          message: "Login realizado com sucesso!",
          empresa: loggedCompany,
        });
    }
  );
});

app.post("/vagas", (req, res) => {
  const {
    titulo,
    localizacao,
    remuneracao,
    requisitos,
    site_empresa,
    cnpj_empresa,
    nome_empresa,
  } = req.body;

  if (
    !titulo ||
    !localizacao ||
    !remuneracao ||
    !requisitos ||
    !site_empresa ||
    !cnpj_empresa ||
    !nome_empresa
  ) {
    return res
      .status(400)
      .json({
        message: "Todos os campos da vaga e dados da empresa são obrigatórios.",
      });
  }

  const requisitosString = Array.isArray(requisitos)
    ? requisitos.join(",")
    : requisitos;

  db.run(
    "INSERT INTO vagas (titulo, localizacao, remuneracao, requisitos, site_empresa, cnpj_empresa, nome_empresa) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      titulo,
      localizacao,
      remuneracao,
      requisitosString,
      site_empresa,
      cnpj_empresa,
      nome_empresa,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erro ao adicionar vaga.", error: err.message });
      }
      return res.status(201).json({
        message: "Vaga adicionada com sucesso!",
        id: this.lastID,
      });
    }
  );
});

app.get("/vagas", (req, res) => {
  db.all("SELECT * FROM vagas ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erro ao buscar vagas.", error: err.message });
    }

    const vagas = rows.map((row) => ({
      ...row,
      // Converte a string de requisitos de volta para Array
      requisitos: row.requisitos
        ? row.requisitos
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : [],
    }));

    return res.status(200).json(vagas);
  });
});

app.get("/vagas/empresa/:cnpj", (req, res) => {
  const { cnpj } = req.params;

  db.all(
    "SELECT * FROM vagas WHERE cnpj_empresa = ? ORDER BY id DESC",
    [cnpj],
    (err, rows) => {
      if (err) {
        return res
          .status(500)
          .json({
            message: "Erro ao buscar vagas da empresa.",
            error: err.message,
          });
      }

      const vagas = rows.map((row) => ({
        ...row,
        requisitos: row.requisitos
          ? row.requisitos
              .split(",")
              .map((r) => r.trim())
              .filter((r) => r.length > 0)
          : [],
      }));

      return res.status(200).json(vagas);
    }
  );
});

app.put("/vagas/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, localizacao, remuneracao, requisitos, site_empresa, cnpj_empresa } =
    req.body;

  if (!titulo || !localizacao || !remuneracao || !requisitos || !site_empresa || !cnpj_empresa) {
    return res
      .status(400)
      .json({
        message: "Todos os campos e o CNPJ da empresa são obrigatórios.",
      });
  }

  const requisitosString = Array.isArray(requisitos)
    ? requisitos.join(",")
    : requisitos;

  db.run(
    "UPDATE vagas SET titulo = ?, localizacao = ?, remuneracao = ?, requisitos = ?, site_empresa = ? WHERE id = ? AND cnpj_empresa = ?",
    [titulo, localizacao, remuneracao, requisitosString, site_empresa, id, cnpj_empresa],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erro ao atualizar vaga.", error: err.message });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ message: "Vaga não encontrada ou acesso negado." });
      }
      return res.status(200).json({
        message: "Vaga atualizada com sucesso!",
      });
    }
  );
});

app.delete("/vagas/:id", (req, res) => {
  const { id } = req.params;
  const { cnpj_empresa } = req.body;

  if (!cnpj_empresa) {
    return res
      .status(400)
      .json({ message: "Dados da empresa são obrigatórios para exclusão." });
  }

  db.run(
    "DELETE FROM vagas WHERE id = ? AND cnpj_empresa = ?",
    [id, cnpj_empresa],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erro ao deletar vaga.", error: err.message });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ message: "Vaga não encontrada ou acesso negado." });
      }
      return res.status(200).json({ message: "Vaga removida com sucesso!" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
