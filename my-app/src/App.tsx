import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useMutation,
  gql,
} from "@apollo/client";

// 替换为你的Worker URL
const WORKER_URL = "https://my-worker.kecan199411.workers.dev/graphql";

const client = new ApolloClient({
  uri: WORKER_URL,
  cache: new InMemoryCache(),
});

const GET_QUESTIONS = gql`
  query {
    questions {
      id
      question
      answer
    }
  }
`;

const ASK_QUESTION = gql`
  mutation AskQuestion($question: String!) {
    askQuestion(question: $question) {
      id
      question
      answer
    }
  }
`;

const QuestionList = () => {
  const { data } = useQuery(GET_QUESTIONS);
  const [askQuestion] = useMutation(ASK_QUESTION, {
    refetchQueries: [GET_QUESTIONS],
  });
  const [newQuestion, setNewQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion({ variables: { question: newQuestion } });
    setNewQuestion("");
  };

  return (
    <div>
      <h2>AI Question App</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question"
        />
        <button type="submit">Ask</button>
      </form>
      <ul>
        {data.questions.map((q: any) => (
          <li key={q.id}>
            <strong>Q: {q.question}</strong>
            <p>A: {q.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <QuestionList />
    </ApolloProvider>
  );
};

export default App;
