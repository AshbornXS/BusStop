const fs = require('fs');
const path = require('path');

// Carrega as variáveis do arquivo .env (apenas para ambiente local)
// O Netlify ignora isso se o arquivo .env não existir lá, o que é o comportamento correto
require('dotenv').config();

// Pega a variável de ambiente
const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";

// Conteúdo do arquivo config.js
const fileContent = `const CONFIG = {
  GOOGLE_MAPS_API_KEY: "${apiKey}"
};`;

// Garante o caminho correto relativo a este script
const targetPath = path.join(__dirname, 'assets', 'js', 'config.js');

fs.writeFileSync(targetPath, fileContent);

console.log(`config.js gerado com sucesso em: ${targetPath}`);
if (!apiKey) {
  console.warn("AVISO: A chave da API está vazia. Verifique seu arquivo .env ou as configurações do Netlify.");
} else {
  console.log("Chave da API injetada com sucesso.");
}
