const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')


const { tag, user} = require('./data')
console.log(tag)
const { ApolloServer, gql } = require('apollo-server-koa');
const typeDefs = gql`
  type User {
    id: Int
    name: String
    sex: String
    age: String
  }

  type Tag {
    id: Int
    commet: String
  }
  
  type Query {
    getUser(id: Int!): User
    getAllUser: [User]
    getTag(id: Int!): Tag
  }

  type Mutation {
    setAge(id: Int!, age: String!): User
  }
`;
 
const resolvers = {
  Query: {
    getUser: (root, { id }) => {
      return user.find(u => u.id === id)
    },
    getAllUser: () => {
      return user
    },
    getTag: (root, { id }) => {
      return tag.find(u => u.id === id)
    }
  },
  Mutation: {
    setAge: (root, { id, age}) => {
      return user.find(u => {
        if(u.id === id) {
          u.age = age
          return u
        }
      })
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });




server.applyMiddleware({ app });
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))


app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
