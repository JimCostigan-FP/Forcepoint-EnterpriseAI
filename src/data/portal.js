export const PORTAL_DATA = {

  howtos: [
    {
      badge: "Beginner", badgeClass: "badge-new",
      title: "Writing your first prompt in Claude",
      desc:  "Be specific about your role, what you need and the format you want. Claude responds to context — the more you give, the better the output.",
      ask:   "Show me how to write a good prompt in Claude with a step-by-step example"
    },
    {
      badge: "Intermediate", badgeClass: "badge-featured",
      title: "Using Claude for document review and summarisation",
      desc:  "Paste a document and ask Claude to extract key decisions, flag risks or rewrite for a specific audience. Works best with reports, policies and contracts.",
      ask:   "Give me 5 tips for using Claude to summarise long documents effectively"
    },
    {
      badge: "Advanced", badgeClass: "badge-ambassador",
      title: "Building multi-step workflows with Claude Projects",
      desc:  "Store context, instructions and knowledge in a Project so Claude understands your team's work without repeating yourself every session.",
      ask:   "Explain how Claude Projects work and give me an example workflow for a sales team"
    },
    {
      badge: "Policy", badgeClass: "badge-policy",
      title: "What not to share with AI tools",
      desc:  "Never input Protected Information, source code, customer PII or Forcepoint Confidential data into any AI tool. Check the AI policy before you start.",
      ask:   "What data is restricted from being shared with AI tools under Forcepoint AI policy?"
    }
  ],

  news: [
    {
      day: "22", month: "Apr",
      badge: "New", badgeClass: "badge-new",
      title: "Forcepoint Enterprise AI launches",
      desc:  "A dedicated portal replaces SharePoint as the home for everything AI at Forcepoint. Requested by David Burden, delivered by Enterprise AI."
    },
    {
      day: "18", month: "Apr",
      badge: "Skills", badgeClass: "badge-featured",
      title: "Salesforce CData Query Cache Skill v1 — now in the library",
      desc:  "Contributed by David Burden. Delivers approximately 85 percent token reduction per query. Available for all authorised enterprise users."
    },
    {
      day: "10", month: "Apr",
      badge: "Program", badgeClass: "badge-ambassador",
      title: "AI Ambassador Forum operating model published",
      desc:  "The Jira and Confluence operating model for the Ambassador Forum is now live. Covers all six department boards and the central platform space."
    },
    {
      day: "1", month: "Apr",
      badge: "Policy", badgeClass: "badge-new",
      title: "AI Policy v1 — updated and in effect",
      desc:  "Forcepoint AI Policy FP-IS-AI updated. All personnel are required to comply. Review the policy before using any AI utility for work purposes."
    }
  ],

  skills: [
    {
      badge: "GA", badgeClass: "badge-ga",
      title: "Salesforce CData Query Cache",
      desc:  "Eliminates redundant discovery calls. ~85% token reduction per typical query. Contributed by David Burden, Apr 18 2026.",
      tags:  ["Salesforce", "CRM", "Data"],
      searchText: "salesforce crm data query"
    },
    {
      badge: "In pilot", badgeClass: "badge-pilot",
      title: "DLP Incident Response Triage",
      desc:  "Assists DLP analysts in classifying and prioritising incidents using behavioural context and policy history.",
      tags:  ["Security", "DLP", "Governance"],
      searchText: "security dlp policy governance"
    },
    {
      badge: "In design", badgeClass: "badge-design",
      title: "Pipeline Intelligence Assistant",
      desc:  "Surfaces deal risk signals and suggests next-best actions for sales reps using CRM and activity data.",
      tags:  ["Sales", "Pipeline", "Revenue"],
      searchText: "sales pipeline forecast revenue"
    },
    {
      badge: "In design", badgeClass: "badge-design",
      title: "Policy Q&A — HR & Legal",
      desc:  "Answers employee questions about Forcepoint policies using approved knowledge sources. Zero hallucination guarantee via grounded retrieval.",
      tags:  ["HR", "Legal", "Operations"],
      searchText: "hr operations legal finance"
    }
  ],

  prompts: [
    {
      badge: "Sales", badgeClass: "badge-featured",
      prompt: "You are an expert in B2B cybersecurity sales. Review this email thread and suggest three ways I could re-engage this prospect without being pushy. Focus on value, not features.",
      submittedBy: "Sales team",
      ask: "You are an expert in B2B cybersecurity sales. Review this email thread and suggest three ways I could re-engage this prospect without being pushy. Focus on value, not features. [Paste your thread here]"
    },
    {
      badge: "Security", badgeClass: "badge-new",
      prompt: "Summarise the key risks in this DLP incident report for a non-technical executive audience. Use plain language. Highlight the top three actions required.",
      submittedBy: "Security team",
      ask: "Summarise the key risks in this DLP incident report for a non-technical executive audience. Use plain language. Highlight the top three actions required. [Paste your report here]"
    },
    {
      badge: "Engineering", badgeClass: "badge-ambassador",
      prompt: "Review this code for security issues, readability and performance. Provide specific, prioritised recommendations. Flag any patterns that could create compliance risk.",
      submittedBy: "Engineering",
      ask: "Review this code for security issues, readability and performance. Provide specific, prioritised recommendations. Flag any patterns that could create compliance risk. [Paste your code here]"
    }
  ],

  events: [
    {
      id:       'evt-2026-04-15',
      date:     '2026-04-15',
      start:    '11:00', end: '12:00', tz: 'CT',
      type:     'brown-bag',
      format:   'virtual',
      title:    'Brown bag: Skills 101 — your first AI skill',
      desc:     'Hands-on intro to authoring a Forcepoint Enterprise AI skill. We build a working skill end-to-end in under an hour.',
      speakers: [{ name: 'Jim Costigan',  role: 'AI Program Manager', initials: 'JC' }],
      capacity: 200, registered: 162,
    },
    {
      id:       'evt-2026-04-29',
      date:     '2026-04-29',
      start:    '12:00', end: '13:00', tz: 'CT',
      type:     'brown-bag',
      format:   'virtual',
      title:    'Brown bag: Getting the most from Claude Projects',
      desc:     'Jim Costigan walks through how to set up a Claude Project for your team — with live demos from Sales and Security teams.',
      speakers: [{ name: 'Jim Costigan',  role: 'AI Program Manager', initials: 'JC' }],
      capacity: 200, registered: 187,
    },
    {
      id:       'evt-2026-05-06',
      date:     '2026-05-06',
      start:    '14:00', end: '15:30', tz: 'CT',
      type:     'ai-council',
      format:   'virtual',
      title:    'AI Council meeting — Q2 program review',
      desc:     'Quarterly review of the AI incubation program. Open to Ambassadors and team leads. Agenda shared 48 hours in advance.',
      speakers: [
        { name: 'Mathew Steele',  role: 'AI Council chair',     initials: 'MS' },
        { name: 'Jim Costigan',   role: 'AI Program Manager',   initials: 'JC' },
      ],
      capacity: null, registered: 38,
    },
    {
      id:       'evt-2026-05-14',
      date:     '2026-05-14',
      start:    '11:00', end: '12:00', tz: 'CT',
      type:     'sprint',
      format:   'virtual',
      title:    'Skills review sprint — Design review ceremony',
      desc:     'Open sprint review for skills currently in the Design Review stage. Ambassador leads and data stewards welcome.',
      speakers: [{ name: 'Skills Engineering', role: 'Design review', initials: 'SE' }],
      capacity: null, registered: 21,
      featured: true,
    },
    {
      id:       'evt-2026-05-20',
      date:     '2026-05-20',
      start:    '12:00', end: '13:30', tz: 'CT',
      type:     'brown-bag',
      format:   'hybrid',
      location: 'Austin HQ',
      title:    'Brown bag: Prompt engineering masterclass',
      desc:     'Advanced prompt techniques for enterprise use cases. Hands-on exercises included. Limited in-person seats — register early.',
      speakers: [{ name: 'David Burden', role: 'Senior Engineer · Sales Eng.', initials: 'DB' }],
      capacity: 30, registered: 24,
    },
    {
      id:       'evt-2026-05-27',
      date:     '2026-05-27',
      start:    '10:00', end: '11:30', tz: 'CT',
      type:     'workshop',
      format:   'virtual',
      title:    'Workshop: Building MCP connectors with the platform team',
      desc:     'Architecture team walkthrough of the MCP connector pattern. Bring a candidate use case — we will scope it live.',
      speakers: [
        { name: 'Architecture Team', role: 'Enterprise AI Platform', initials: 'AT' },
        { name: 'Jim Costigan',      role: 'AI Program Manager',     initials: 'JC' },
      ],
      capacity: 50, registered: 12,
    },
    {
      id:       'evt-2026-06-03',
      date:     '2026-06-03',
      start:    '12:00', end: '13:00', tz: 'CT',
      type:     'brown-bag',
      format:   'virtual',
      title:    'Brown bag: Token economics — measuring savings in your skill',
      desc:     'How to baseline a workflow, instrument the skill, and report savings the AI Council will accept.',
      speakers: [{ name: 'David Burden', role: 'Senior Engineer · Sales Eng.', initials: 'DB' }],
      capacity: 200, registered: 4,
    },
    {
      id:       'evt-2026-06-17',
      date:     '2026-06-17',
      start:    '14:00', end: '15:00', tz: 'CT',
      type:     'ai-council',
      format:   'virtual',
      title:    'AI Council meeting — June review',
      desc:     'Mid-quarter status of all in-pilot skills, deprecation candidates, and trust-tier promotions.',
      speakers: [{ name: 'AI Council', role: 'Quarterly steering', initials: 'AC' }],
      capacity: null, registered: 0,
    },
  ],

  ambassador: [
    {
      badge: "Role", badgeClass: "badge-ambassador",
      title: "What is an AI Ambassador?",
      body:  "A 3–5 person team in your department that owns skill intake, design and governance. Ambassadors bridge the gap between what your team needs and what the platform can deliver."
    },
    {
      badge: "Commitment", badgeClass: "badge-new",
      title: "What's involved?",
      body:  "Weekly intake reviews, bi-weekly sprint ceremonies, Confluence documentation and close collaboration with the central Enterprise AI team. Approximately 3–5 hours per week."
    },
    {
      badge: "Roles", badgeClass: "badge-featured",
      title: "Three roles per team",
      body:  "Lead (owns the board), Designer (drafts skill contracts) and Data Steward or SME (owns data scope and compliance sign-off). All trained by Enterprise AI."
    },
    {
      badge: "Boards", badgeClass: "badge-ambassador",
      title: "Current ambassador teams",
      body:  "Security, ONE Network, DLP, Sales and Biz Dev, Operations. Each team has a dedicated Jira Kanban board and Confluence space."
    }
  ],

  architecture: [
    {
      colorClass: "",
      title: "What IT is responsible for",
      items: [
        "Enterprise Claude account management and access provisioning",
        "MCP server infrastructure and Shared S1 components",
        "Skills catalog registration and version control",
        "SSO and identity integration",
        "DLP policy enforcement on AI prompts and responses",
        "Security monitoring and alert infrastructure",
        "Confluence and Jira platform administration"
      ]
    },
    {
      colorClass: "amber",
      title: "What teams are responsible for",
      items: [
        "Skill design and use case definition",
        "Data steward identification and sign-off",
        "Pilot cohort selection and feedback",
        "Business outcome measurement",
        "Compliance with the AI policy",
        "Ambassador board governance within their department"
      ]
    },
    {
      colorClass: "navy",
      title: "How to engage IT for a new AI integration",
      items: [
        "1. File a skill intake story on the AI Jira board (AI-PLT project)",
        "2. Identify your data steward and trust tier",
        "3. Attend a design review session with the architecture team",
        "4. Receive sign-off before any development begins",
        "5. IT registers the approved skill in the enterprise catalog"
      ]
    },
    {
      colorClass: "",
      title: "Architecture references",
      items: [
        "ADD v1.10 (Architecture Design Document)",
        "Claude LangGraph and NMAP execution paths",
        "MCP Observability Portal",
        "Jira Skills Governance Dashboard",
        "Forcepoint SIEM Feed integration"
      ]
    }
  ]
}
