import React from "react";

type Props = {
  skills: string[];
};

const bank: Record<string, string[]> = {
  frontend: [
    "Explain the Virtual DOM and how React reconciles updates.",
    "What are the differences between useEffect and useLayoutEffect?",
    "How would you optimize a large React list for performance?",
    "Describe CSS specificity and how to avoid conflicts.",
  ],
  backend: [
    "Explain REST vs. GraphQL trade‑offs.",
    "How do you design an idempotent API and why is it important?",
    "What strategies do you use for rate limiting and throttling?",
    "How do you handle background jobs and retries?",
  ],
  "data structures & algorithms": [
    "Given an array, find two numbers that add up to a target (time/space trade‑offs).",
    "Detect a cycle in a linked list and find the cycle start.",
    "K largest elements in a stream: discuss heap vs. quickselect.",
    "Explain time complexity of common sorting algorithms.",
  ],
  databases: [
    "When would you choose a NoSQL store over a relational database?",
    "Explain indexing (B‑Tree vs Hash) and how it impacts writes/reads.",
    "What is transaction isolation and what anomalies can occur?",
    "How do you design an efficient pagination query?",
  ],
  devops: [
    "Blue‑green vs rolling deployments — differences and trade‑offs.",
    "How do you secure secrets in CI/CD?",
    "Explain container resource limits and how to right‑size workloads.",
    "What are SLOs/SLIs and how would you define them for a service?",
  ],
  "system design": [
    "Design a URL shortener (discuss hashing, storage, and scaling).",
    "Design a news feed with fan‑out strategies and caching layers.",
    "How would you design a rate limiter for a global API?",
    "Design an image hosting service (upload pipeline, metadata, CDN).",
  ],
};

const allFallback = [
  "Walk me through a recent technical challenge and how you solved it.",
  "Describe a time you improved performance in a system or UI.",
  "How do you approach testing and ensuring code quality?",
  "Tell me about a design decision you reversed and why.",
];

const normalize = (s: string) => s.trim().toLowerCase();

const InterviewQuestions: React.FC<Props> = ({ skills }) => {
  const normalized = new Set(skills.map(normalize));

  const collected = Object.entries(bank)
    .filter(([k]) => normalized.has(k))
    .flatMap(([, qs]) => qs);

  const questions = collected.length ? collected : allFallback;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Frequently asked interview questions</h2>
      {skills.length > 0 ? (
        <p className="text-xs text-gray-500 mb-3">Based on your skills: {skills.join(", ")}</p>
      ) : (
        <p className="text-xs text-gray-500 mb-3">No strong skills detected yet. Showing general questions.</p>
      )}
      <ol className="list-decimal pl-5 space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="text-sm text-gray-900">{q}</li>
        ))}
      </ol>
    </div>
  );
};

export default InterviewQuestions;
