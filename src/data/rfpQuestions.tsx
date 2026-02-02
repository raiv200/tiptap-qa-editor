// data/rfpQuestions.ts

export type RFPQuestion = {
  id: string;
  title: string;
  fullQuestion: string;
};

export type RFPSection = {
  id: number;
  title: string;
  questions: RFPQuestion[];
};

export const RFP_SECTIONS: RFPSection[] = [
  {
    id: 1,
    title: "Company Information",
    questions: [
      {
        id: "q1-1",
        title: "Q 1.1 - Company Overview",
        fullQuestion: "Provide a brief overview of your company.",
      },
      {
        id: "q1-2",
        title: "Q 1.2 - Company History",
        fullQuestion:
          "Provide an overview of your company's founding, evolution, and key milestones.",
      },
      {
        id: "q1-3",
        title: "Q 1.3 - Certifications & Compliance",
        fullQuestion:
          "List your key certifications and compliance standards.",
      },
    ],
  },
  {
    id: 2,
    title: "Technical Requirements",
    questions: [
      {
        id: "q2-1",
        title: "Q 2.1 - System Architecture",
        fullQuestion:
          "Describe your system architecture and technology stack.",
      },
      {
        id: "q2-2",
        title: "Q 2.2 - Scalability Features",
        fullQuestion:
          "Explain how your solution handles scalability and high availability.",
      },
      {
        id: "q2-3",
        title: "Q 2.3 - API Integration",
        fullQuestion:
          "Describe your API integration capabilities and supported protocols. Please provide details about your API architecture, supported protocols (REST, GraphQL, SOAP), authentication methods, rate limiting, and documentation standards. Include information about webhook support and real-time data synchronization.",
      },
      {
        id: "q2-4",
        title: "Q 2.4 - Data Migration",
        fullQuestion:
          "Describe your approach to data migration and transition support.",
      },
      {
        id: "q2-5",
        title: "Q 2.5 - Performance Metrics",
        fullQuestion:
          "What are your system's performance metrics and SLA guarantees?",
      },
    ],
  },
  // {
  //   id: 3,
  //   title: "Security & Compliance",
  //   questions: [
  //     {
  //       id: "q3-1",
  //       title: "Q 3.1 - Security Measures",
  //       fullQuestion:
  //         "Describe your security architecture and data protection measures.",
  //     },
  //     {
  //       id: "q3-2",
  //       title: "Q 3.2 - Compliance Standards",
  //       fullQuestion:
  //         "List all compliance standards your solution adheres to (SOC 2, ISO, GDPR, etc.).",
  //     },
  //     {
  //       id: "q3-3",
  //       title: "Q 3.3 - Incident Response",
  //       fullQuestion:
  //         "Describe your incident response procedures and disaster recovery plans.",
  //     },
  //   ],
  // },
  // {
  //   id: 4,
  //   title: "Pricing & Commercial",
  //   questions: [
  //     {
  //       id: "q4-1",
  //       title: "Q 4.1 - Pricing Model",
  //       fullQuestion:
  //         "Provide details about your pricing structure and available plans.",
  //     },
  //     {
  //       id: "q4-2",
  //       title: "Q 4.2 - Contract Terms",
  //       fullQuestion:
  //         "What are your standard contract terms and renewal options?",
  //     },
  //     {
  //       id: "q4-3",
  //       title: "Q 4.3 - Support Packages",
  //       fullQuestion:
  //         "Describe available support packages and service level agreements.",
  //     },
  //   ],
  // },
];