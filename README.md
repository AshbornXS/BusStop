# BusStop — API

Breve descrição
--------------
API simples para registrar e consultar localizações de ônibus, além de autenticação e endpoints para gerenciamento de usuário.

Rotas da API
------------
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


Autenticação
------------
- Envie o token JWT no header Authorization no formato:
  Authorization: Bearer <token>
```
