import React from "react";

type Props = {
  skills: string[];
};

const HackathonInformer: React.FC<Props> = ({ skills }) => {
  const normalized = new Set(skills.map((s) => s.toLowerCase()));

  const all = [
    { name: "Frontend Web Challenge", tags: ["frontend"] },
    { name: "Full‑Stack Builder Hack", tags: ["frontend", "backend", "databases"] },
    { name: "Algo Sprint", tags: ["data structures & algorithms", "dsa"] },
    { name: "Cloud & DevOps Jam", tags: ["devops"] },
    { name: "System Design Derby", tags: ["system design"] },
    { name: "Open Source Weekend", tags: ["frontend", "backend"] },
  ];

  const recommended = all.filter((h) => h.tags.some((t) => normalized.has(t)));
  const fallback = recommended.length ? recommended : all.slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Hackathon informer</h2>
      {skills.length > 0 ? (
        <p className="text-xs text-gray-500 mb-3">Based on your skills: {skills.join(", ")}</p>
      ) : (
        <p className="text-xs text-gray-500 mb-3">No strong skills detected yet. Showing popular hackathons.</p>
      )}
      <ul className="space-y-2">
        {fallback.map((h) => (
          <li key={h.name} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
            <span className="text-sm text-gray-900">{h.name}</span>
            <a
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              href="#"
            >
              View details
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HackathonInformer;
