const sqlite3 = require("sqlite3").verbose();
const dbName = "etisc.db";

const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
    db.run("PRAGMA foreign_keys = ON;");
    createTables();
  }
});

const createTables = () => {
  const createEmpresasTable = `
    CREATE TABLE IF NOT EXISTS empresas (
      cnpj TEXT PRIMARY KEY NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      senha TEXT NOT NULL
    );
  `;

  const createVagasTable = `
    CREATE TABLE IF NOT EXISTS vagas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      localizacao TEXT NOT NULL,
      remuneracao TEXT NOT NULL,
      requisitos TEXT NOT NULL,
      site_empresa TEXT NOT NULL,
      cnpj_empresa TEXT NOT NULL,
      nome_empresa TEXT NOT NULL,
      FOREIGN KEY (cnpj_empresa) REFERENCES empresas (cnpj) ON DELETE CASCADE
    );
  `;

  db.serialize(() => {
    db.run(createEmpresasTable, (err) => {
      if (err) {
        console.error("Erro ao criar tabela 'empresas':", err.message);
      } else {
        console.log("Tabela 'empresas' pronta.");
      }
    });

    db.run(createVagasTable, (err) => {
      if (err) {
        console.error("Erro ao criar tabela 'vagas':", err.message);
      } else {
        console.log("Tabela 'vagas' pronta.");
      }
    });
  });
};

module.exports = db;