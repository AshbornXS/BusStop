# BusStop — API

Breve descrição
--------------
API simples para registrar e consultar localizações de ônibus, além de autenticação e endpoints para gerenciamento de usuário.

Rotas da API
------------
| Método | Rota | Descrição | Autenticação | Body / Params |
|---|---:|---|---|---|
| GET | / | Rota de teste (retorna "🚍 BuStop API rodando!") | Não | — |
| POST | /api/auth/register | Registrar novo usuário (cria e faz login) | Não | { name, email, password } |
| POST | /api/auth/login | Autenticar usuário e retornar token JWT | Não | { email, password } |
| POST | /api/locations | Receber / salvar localização de um ônibus | Não | { busId, latitude, longitude } |
| GET | /api/locations/:busId | Buscar última posição do ônibus | Não | Param: busId |
| GET | /api/locations/all/:busId | Buscar todas as posições do ônibus | Não | Param: busId |
| GET | /api/user/profile | Obter perfil do usuário | Sim (Bearer token) | Header: Authorization: Bearer <token> |
| PUT | /api/user/profile | Atualizar perfil do usuário | Sim (Bearer token) | Campos permitidos: name, email, CEP, street, number, complement, neighborhood, city, state, CPF, phone, saldo |
| POST | /api/user/balance | Adicionar saldo ao usuário | Sim (Bearer token) | { amount: number } |
| GET | /api/user/is-expired | Verificar se o usuário está expirado (>1 ano) | Sim (Bearer token) | — |

Autenticação
------------
- Envie o token JWT no header Authorization no formato:
  Authorization: Bearer <token>

Observações
----------
- Para salvar localização envie os campos busId, latitude e longitude no body como JSON.
- O endpoint de /api/auth/login no código busca por "username" — confirme se sua aplicação usa username ou email.
- Esta README é focada nas rotas; adicione instruções de instalação e uso conforme necessário.

```
