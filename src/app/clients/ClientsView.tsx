import React from "react";

const clients = [
  {
    id: 1,
    name: "Client A",
    email: "clienta@example.com",
    projects: ["Project Alpha", "Project Beta"],
  },
  {
    id: 2,
    name: "Client B",
    email: "clientb@example.com",
    projects: ["Project Gamma", "Project Delta"],
  },
  {
    id: 3,
    name: "Client C",
    email: "clientc@example.com",
    projects: ["Project Epsilon", "Project Zeta"],
  },
];

const ClientsView = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <div
          key={client.id}
          className="rounded-2xl bg-white p-4 shadow-lg transition-shadow hover:shadow-2xl"
        >
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-base text-gray-600">{client.email}</p>
          <ul className="mt-2">
            {client.projects.map((project, index) => (
              <li key={index} className="text-xl text-black">
                {project}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ClientsView;
