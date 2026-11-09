# MaterSys / IRONGATE — entrega de João Paulo

Esta etapa implementa **Usuário, Plano e Contrato**, a conexão PostgreSQL e o frontend com login e manutenção desses três cadastros. As entidades Aluno, Treinador, Modalidade, Turma e Inscricao ficam para os outros integrantes.

Guia rápido: [comandos comentados para rodar o projeto](COMANDOS.md).

## Executar

Abra dois terminais na pasta do projeto.

Backend:
```powershell
cd desenvWebBack
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend:
```powershell
cd desenvWebFront
npm ci
npm run dev
```

Abra http://localhost:5173. O frontend encaminha /api para a porta PORT do .env do backend (3000 se não configurada; nesta máquina, 8080).
As migrations e os seeds já foram aplicados no banco local desenvweb_am. Executar novamente não duplica os dados, pois o Sequelize registra o histórico.

## Contas de demonstração

| Perfil | Email | Senha |
|---|---|---|
| Administrador | admin@teste.com | 123456 |
| Aluno | aluno@teste.com | 123456 |

ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD podem mudar a conta inicial do administrador antes do primeiro seed.
Os seeds são de desenvolvimento e não executam com NODE_ENV=production.
Alterar essas variáveis depois de executar o seed não modifica uma conta existente.

## Configuração local

O arquivo desenvWebBack/.env permanece apenas na sua máquina.
Use .env.example como referência em uma nova instalação.
Variáveis: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT=postgres, DB_SSL, PORT e JWT_SECRET.
JWT_SECRET deve conter pelo menos 32 caracteres; a chave local já foi gerada.
Para ambiente de teste separado, use NODE_ENV=test e DB_NAME_TEST.
DB_SSL=true habilita TLS com validação do certificado.
FRONTEND_URL configura a origem permitida em acesso direto à API.
VITE_API_URL e API_PROXY_TARGET, opcionais no frontend, permitem apontar para outro backend. Nunca coloque senha do banco em variável VITE_.

## Banco de dados

- **usuarios:** id, nome, email único, senha com hash bcrypt, perfil (ADMIN/TREINADOR/ALUNO), ativo e datas de criação/atualização.
- **planos:** id, nome único, descricao, valor_mensal, limite_modalidades e ativo. Limite nulo significa ilimitado.
- **contratos:** id, usuario_id, plano_id, data_inicio, data_fim, valor_mensal, status (ATIVO/CANCELADO/ENCERRADO), data_assinatura e observacoes.

O contrato referencia uma conta com perfil ALUNO em usuarios. Essa conta não é o cadastro da entidade Aluno.
Quando Gabriel implementar Aluno, ele poderá criar aluno.usuario_id único com chave estrangeira para usuarios.id. O contrato continua ligado à mesma identidade, sem depender de uma tabela ainda inexistente.
Outras relações previstas: Treinador também poderá referenciar Usuario; Inscricao referencia Aluno e Turma.
Não use sequelize.sync({ force: true }) nem alter para substituir as migrations.

O valor mensal do contrato é copiado do plano na criação e permanece registrado. Alterar o preço do plano não altera contratos anteriores.
A data final não pode anteceder a inicial. Valores negativos e perfis/status inválidos são rejeitados.
Usuarios e planos com contratos não podem ser excluídos: desative o cadastro ou encerre/cancele o contrato. Administradores não podem excluir ou retirar o próprio acesso.
O status do contrato é administrado manualmente nesta etapa; não há agendamento de renovação ou cobrança.

## API

Todas as rotas, exceto login e health, exigem Authorization: Bearer <token>.

| Método | Rota | Acesso |
|---|---|---|
| POST | /login | Público; body com email e senha |
| GET | /health | Público; verifica conexão com o banco |
| GET | /auth/me | Usuário autenticado |
| GET, POST | /usuarios | Administrador |
| GET, PUT, DELETE | /usuarios/:id | Administrador |
| GET | /planos e /planos/:id | Usuário autenticado |
| POST, PUT, DELETE | /planos e /planos/:id | Administrador |
| GET | /contratos e /contratos/:id | Administrador vê todos; demais perfis veem somente os próprios |
| POST, PUT, DELETE | /contratos e /contratos/:id | Administrador |

POST atua na coleção; PUT e DELETE atuam no endereço com :id.

Exemplo de plano:
```json
{"nome":"Mensal","descricao":"Uma modalidade","valor_mensal":"120.00","limite_modalidades":1,"ativo":true}
```

Exemplo de contrato (substitua os IDs por registros existentes):
```json
{"usuario_id":2,"plano_id":1,"data_inicio":"2026-11-09","data_fim":"2027-11-09"}
```

No frontend, o administrador pode cadastrar, editar e excluir usuários, planos e contratos. O aluno consulta planos e seus próprios contratos.
A sessão usa JWT com validade de duas horas e é verificada novamente pelo backend. O token fica no sessionStorage da aba e é removido ao sair. Desativar uma conta impede o uso de tokens já emitidos.
Não há cadastro público, recuperação de senha, cobrança ou assinatura digital de contratos nesta entrega.

## Verificação

```powershell
cd desenvWebBack
npm test
npm run db:migrate:status

cd ../desenvWebFront
npm run build
```

Os testes usam o banco configurado e criam registros temporários identificados como teste. Removem apenas os próprios registros ao terminar; não apagam os seeds.
Execute com o banco de desenvolvimento ou com NODE_ENV=test e DB_NAME_TEST previamente preparado com migrations e seeds.
O fluxo inclui login inválido/válido, proteção de rotas, hashes de senha, permissões, CRUD, datas, preço histórico e proteção dos vínculos.

Comandos de reversão disponíveis:
- npm run db:seed:undo: remove os dados demonstrativos, na ordem inversa. Não use se eles já tiverem vínculos com cadastros reais.
- npm run db:migrate:undo: desfaz a última migration e apaga sua tabela. Use somente em banco de desenvolvimento descartável.

## Git e trabalho em grupo

O .env e as duas pastas node_modules foram retirados do rastreamento, mantendo os arquivos locais. Por isso aparecem muitas remoções no próximo commit; são dependências que cada integrante reinstala com npm ci.
Os package-lock.json continuam versionados.
A remoção do .env do rastreamento evita novos envios, mas não altera o histórico antigo do Git.
Nenhum commit ou push foi feito nesta etapa. Revise e faça seu commit com sua identidade já configurada no Git. Seus colegas devem implementar e commitar suas entidades nas próprias contas.

As páginas seguem a identidade vermelha e escura do wireframe. O painel desta etapa cobre somente as três entidades de João Paulo.
