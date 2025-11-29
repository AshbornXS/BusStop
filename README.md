# 🚍 BusStop - Gestão de Transporte Urbano

![BusStop Banner](frontend/assets/images/index.jpg)

> Simplificando sua mobilidade urbana. Recarregue, renove e planeje suas rotas, tudo em um só lugar.

## 📖 Sobre o Projeto

O **BusStop** é uma plataforma completa (Web e PWA) desenvolvida para modernizar a experiência do usuário de transporte público. O sistema permite que passageiros gerenciem seus cartões de transporte, realizem recargas via PIX, solicitem renovação de benefícios estudantis/especiais enviando documentos digitalmente e visualizem as rotas dos ônibus em tempo real através de mapas interativos.

Além disso, o sistema conta com um **Painel Administrativo** robusto para gestão de usuários e aprovação de documentos.

## 🚀 Funcionalidades Principais

### 👤 Área do Usuário
* **Autenticação Segura:** Login e Cadastro com criptografia de senha e JWT.
* **Perfil:** Gestão de dados pessoais e visualização de saldo e status da carteirinha.
* **Recarga Online:** Simulação de fluxo de pagamento via PIX com atualização automática de saldo.
* **Renovação Digital:** Envio de documentos (PDF/Imagem) para renovação de benefícios sem filas.
* **Mapa de Linhas:** Visualização de trajetos e simulação de movimento de ônibus utilizando a Google Maps API.
* **PWA (Progressive Web App):** Instalável em dispositivos móveis.

### 🛡️ Área Administrativa
* **Gestão de Usuários:** Visualizar, editar e excluir usuários do sistema.
* **Gestão de Documentos:** Visualizar arquivos enviados, aprovar renovações ou excluir documentos.
* **Dashboard:** Visão geral de cadastros e uploads.

## 🛠️ Tecnologias Utilizadas

### Frontend
* **HTML5, CSS3 & JavaScript (ES6+)**
* **Google Maps API** (Integração de mapas)
* **FontAwesome** (Ícones)
* **PWA** (Service Workers & Manifest)

### Backend
* **Node.js & Express**
* **MongoDB & Mongoose** (Banco de dados NoSQL)
* **JWT** (JSON Web Token para autenticação)
* **Multer & GridFS** (Upload e armazenamento de arquivos no Mongo)
* **BcryptJS** (Hash de senhas)
> Para ver o código do hardware dedicado clique [aqui](https://github.com/AshbornXS/BusStop-ESP32/blob/main/src/main.cpp)

## ⚙️ Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (v18 ou superior recomendado)
* [MongoDB](https://www.mongodb.com/) (Local ou Atlas URL)

## 📦 Como Rodar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/ashbornxs/busstop.git
cd busstop
````

### 2\. Configurar o Backend

Navegue até a pasta do servidor e instale as dependências:

```bash
cd backend
npm install
```

Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:

```env
PORT=5000
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
```

Inicie o servidor:

```bash
npm start
# Ou para desenvolvimento com nodemon:
npm run dev
```

### 3\. Configurar o Frontend

Navegue até a pasta do frontend e instale as dependências (necessário para injetar a API Key):

```bash
cd ../frontend
npm install
```

Crie um arquivo `.env` na raiz da pasta `frontend` com sua chave do Google Maps:

```env
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

Gere o arquivo de configuração e inicie a aplicação:

```bash
# Isso criará o arquivo assets/js/config.js com a chave
npm run build
```

> **Nota:** Como o frontend é estático (HTML/CSS/JS), você pode rodá-lo utilizando a extensão **Live Server** do VSCode ou qualquer servidor HTTP estático simples. Certifique-se de que a `API_URL` nos arquivos `.js` do frontend esteja apontando para o seu backend (padrão: `http://localhost:5000` ou sua URL de deploy).

## 🔌 Rotas da API

Aqui estão os principais endpoints disponíveis no backend:

| Método | Rota | Descrição | Autenticação | Body / Params |
|---|---:|---|---|---|
| GET | / | Rota de teste (retorna "🚍 BusStop API rodando!") | Não | — |
| POST | /auth/register | Registrar novo usuário (cria e faz login) | Não | { name, email, password } |
| POST | /auth/login | Autenticar usuário e retornar token JWT | Não | { email, password } |
| POST | /locations | Receber / salvar localização de um ônibus | Não | { busId, latitude, longitude } |
| GET | /locations/:busId | Buscar última posição do ônibus | Não | Param: busId |
| GET | /locations/all/:busId | Buscar todas as posições do ônibus | Não | Param: busId |
| GET | /user/profile | Obter perfil do usuário | Sim (Bearer token) | Header: Authorization: Bearer <token> |
| PUT | /user/profile | Atualizar perfil do usuário | Sim (Bearer token) | Campos permitidos: name, email, CEP, street, number, complement, neighborhood, city, state, CPF, phone, saldo |
| POST | /user/balance | Adicionar saldo ao usuário | Sim (Bearer token) | { amount: number } |
| GET | /user/is-expired | Verificar se o usuário está expirado (>1 ano) | Sim (Bearer token) | — |
| GET | /user | Exibir todos os usuários cadastrados | Sim (Bearer token & Admin account) | — |
| PUT | /user/:id | Atualizar perfil de qualquer usuário cadastrado | Sim (Bearer token & Admin account) | Campos permitidos: nome, CPF e saldo |
| DEL | /user/:id | Apagar registro de qualquer usuário | Sim (Bearer token & Admin account) |
| POST | /files/upload | Realiza o upload dos documentos | Sim (Bearer token) | — |
| GET | /files | Retorna todos os arquivos salvos | Sim (Bearer token & Admin account) | — |
| GET | /files/:id | Retorna todos os arquivos relacionados ao ID de um usuário | Sim (Bearer token & Admin account) | — |

## 👥 Equipe de Desenvolvimento

Projeto desenvolvido por estudantes dedicados:

  * 🎓 **Beatriz Vitoria Lourenco Vitoriano**
  * 🎓 **Bianca Sousa Sales Paiva**
  * 🎓 **Liz Almeida de Oliveira**
  * 🎓 **Pedro Henrique Alves de Azevedo**
  * 🎓 **Wyllerson de Aquino Cavenaghi**

## 📄 Licença

Este projeto está sob a licença ISC.

-----

Feito com 🚌 e ❤️ pela equipe BusStop.
