# Comandos para rodar o sistema

## 1. Primeira configuração do banco

O servidor PostgreSQL deve estar em execução. Abrir o pgAdmin, sozinho, não necessariamente inicia o servidor.

```powershell
# Entre no backend. Ajuste este caminho em outros computadores.
cd "$env:USERPROFILE\Documents\GitHub\MaterSys\desenvWebBack"

# Instale as dependências nas versões do package-lock.json.
npm ci

# Crie o .env apenas se ele ainda não existir, preservando os dados locais.
if (!(Test-Path .env)) { Copy-Item .env.example .env }

# Preencha DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD.
# Nesta máquina o nome do banco é desenvweb_am.
notepad .env

# SOMENTE se JWT_SECRET estiver vazio, gere uma chave e copie
# o resultado para JWT_SECRET no .env. Não publique essa chave.
# Se JWT_SECRET já estiver preenchido, mantenha a chave existente.
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# SOMENTE se o banco configurado no .env ainda não existir:
# npm run db:create

# Crie as tabelas aplicando as migrations pendentes.
npm run db:migrate

# Insira os dados demonstrativos. O histórico evita repetir os seeds aplicados.
npm run db:seed

# Confira se todas as migrations estão com status 'up'.
npm run db:migrate:status
```

O modelo completo de configuração está em `desenvWebBack/.env.example`. As credenciais ficam somente no backend.

**Nesta máquina, o banco e os dados demonstrativos já estão preparados. No uso diário, comece pela etapa 2.**

## 2. Terminal 1 — backend

```powershell
# Entre na pasta do backend.
cd "$env:USERPROFILE\Documents\GitHub\MaterSys\desenvWebBack"

# Inicie a API; o nodemon reinicia após mudanças no código.
# Mantenha este terminal aberto.
npm run dev

# Para encerrar, pressione Ctrl+C neste terminal.
```

A porta é definida por `PORT` no `.env`: atualmente **8080** nesta máquina.
Confira a conexão em http://localhost:8080/health. Se mudar a porta, ajuste esse endereço.

## 3. Terminal 2 — frontend

```powershell
# Abra OUTRO terminal e entre no frontend.
cd "$env:USERPROFILE\Documents\GitHub\MaterSys\desenvWebFront"

# Instale na primeira utilização ou após mudanças nas dependências.
npm ci

# Inicie a interface; mantenha este terminal aberto.
npm run dev

# Para encerrar, pressione Ctrl+C neste terminal.
```

Abra **http://localhost:5173**. O frontend encaminha as chamadas para a porta configurada no backend. Ao alterar essa porta, reinicie também o frontend.

## 4. Contas de demonstração

| Perfil | Email | Senha |
|---|---|---|
| Administrador | admin@teste.com | 123456 |
| Aluno | aluno@teste.com | 123456 |

As contas são criadas pelos seeds de desenvolvimento. ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD podem alterar a conta inicial do administrador antes do primeiro seed.

## 5. Verificar antes do commit

```powershell
# Use um terminal livre e entre no backend.
cd "$env:USERPROFILE\Documents\GitHub\MaterSys\desenvWebBack"

# Teste login, permissões e cadastros.
# O banco deve estar configurado com migrations e seeds aplicados.
# Os testes criam e removem somente seus próprios registros temporários.
npm test

# Confira as migrations aplicadas.
npm run db:migrate:status

# Entre no frontend e confira a compilação.
cd ..\desenvWebFront
npm run build

# Volte à raiz e confira os arquivos alterados antes de commitar.
cd ..
git status

# Não inclua .env, node_modules ou dist no commit.
```

## 6. Se não conectar

- Confira se o servidor PostgreSQL está rodando e se o banco `desenvweb_am` existe.
- Confira as variáveis do `.env`, sem publicar senhas.
- Se faltarem tabelas, execute `npm run db:migrate` dentro do backend.
- Mantenha os dois terminais abertos.
- Se a porta estiver ocupada, confira se já existe outra instância do projeto aberta antes de iniciar novamente.
