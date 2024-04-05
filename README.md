# Pass.in Back-end

O Pass.in é uma aplicação para **gestão de participantes em eventos presenciais**, permitindo que organizadores cadastrem eventos e gerenciem inscrições e check-ins de participantes de maneira eficiente.

Esta aplicação back-end lida com todas as operações de dados, desde o cadastro de eventos até a gestão de participantes e o processamento de check-ins.

## Links de Acesso a API

🔗 Link da api para uso: https://api.pass-in.pro
🔗 Link da documentação: https://api.pass-in.pro/docs

## Funcionalidades

O back-end do Pass.in suporta as seguintes funcionalidades:

- Cadastro e gerenciamento de eventos
- Visualização de detalhes do evento e lista de participantes
- Inscrição de participantes em eventos
- Emissão de credenciais para participantes
- Check-in e cancelamento de check-in de participantes
- Edição de dados de participantes

## Tecnologias Utilizadas

- **Node.js** e **Express** para a construção do servidor
- **Prisma** como ORM para o gerenciamento do banco de dados
- **SQLite** para desenvolvimento e **PostgreSQL** para produção
- **Swagger** para documentação da API

## Executando Localmente

Para executar o back-end localmente, siga os passos abaixo:

1. Clone o repositório:

```bash
git clone https://github.com/Lag0/nlw-unite-nodejs.git
cd nlw-unite-nodejs
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com a seguinte linha, que configura o banco de dados para usar SQLite no ambiente de desenvolvimento:

```env
DATABASE_URL="file:./dev.db"
```

4. Atualize o `schema.prisma` para usar SQLite:

De:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Para:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

5. Execute as migrações para criar o banco de dados:

```bash
npx prisma migrate dev
```

6. Inicie o servidor:

```bash
npm run dev
```

A API agora estará rodando localmente e acessível via `http://localhost:3333`.

## Documentação da API

Acesse `http://localhost:3333/docs` para visualizar a documentação da API Swagger e testar os endpoints.

## Estrutura do Banco de Dados

O diagrama ERD e a estrutura SQL fornecidos detalham o design do banco de dados usado pela aplicação. Para ambientes de produção, recomenda-se o uso de PostgreSQL.

## Contribuindo

Contribuições são bem-vindas! Para contribuir, por favor, crie um fork do repositório, faça suas alterações e submeta um pull request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---
