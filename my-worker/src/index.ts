import { createYoga, createSchema } from 'graphql-yoga'
import type { ExportedHandler } from '@cloudflare/workers-types'

interface Question {
  id: string
  question: string
  answer: string
}

const questions: Question[] = []

const typeDefs = `
  type Question {
    id: ID!
    question: String!
    answer: String!
  }

  type Query {
    questions: [Question!]!
  }

  type Mutation {
    askQuestion(question: String!): Question!
  }
`

const resolvers = {
  Query: {
    questions: () => questions,
  },
  Mutation: {
    askQuestion: (_: unknown, { question }: { question: string }): Question => {
      const answer = `AI回答：这是关于"${question}"的模拟回答`
      const newQuestion: Question = {
        id: Date.now().toString(),
        question,
        answer,
      }
      questions.push(newQuestion)
      return newQuestion
    },
  },
}

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: '/graphql',
  cors: {
    origin: '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  },
})

const worker: ExportedHandler = {
  fetch: yoga.fetch as any,
}

export default worker