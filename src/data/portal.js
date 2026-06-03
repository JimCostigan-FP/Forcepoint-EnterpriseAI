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

  // Sourced from the SharePoint "AI Ambassadors" page
  // (sites/ArtificialIntelligence/SitePages/AI-Ambassadors.aspx), last
  // refreshed 2026-06-03. Update here when the SharePoint roster/mission change.
  ambassador: {
    intro: "Discover your AI Ambassadors — leaders who drive AI innovation and support across functions. Connect with them, explore their work, and learn how they empower your AI projects and initiatives.",
    roster: [
      { name: "Nirav Shah",         role: "VP, Product Engineering",                                      department: "2590 Product - Rapid Deployment", email: "nshah@forcepoint.com" },
      { name: "Jaakko Moller",       role: "Director, Network Security Engineering",                       department: "2420 Engineering - NGFW",         email: "jaakko.moller@forcepoint.com" },
      { name: "Anthony Bennis",      role: "Sr. Manager, Product Management",                              department: "2320 Product Management - SSE",   email: "anthony.bennis@forcepoint.com" },
      { name: "Clark Green",         role: "Vice President, Revenue Operations",                           department: "3113 Sales - Ops Mgmt",           email: "clark.green@forcepoint.com" },
      { name: "Kavita Samuel Lover", role: "Sr. Director, Marketing Strategy and Operations",              department: "4210 Web & MOps Marketing",       email: "kavita.samuel@forcepoint.com" },
      { name: "Todd Sheets",         role: "Data Transformation Manager",                                  department: "5500 Finance",                    email: "todd.sheets@forcepoint.com" },
      { name: "Anabella Teverovsky", role: "Senior Director, Global Financial Reporting",                  department: "5200 Accounting",                 email: "anabella.teverovsky@forcepoint.com" },
      { name: "Mathew Steele",       role: "Director, Enterprise Systems",                                 department: "5450 IT - Business Services",     email: "mathew.steele@forcepoint.com" },
      { name: "Mike Thomas",         role: "Senior Director of Procurement",                               department: "5530 Procurement",                email: "mike.thomas@forcepoint.com" },
      { name: "Mayan Goldman",       role: "Sr. Manager, Facilities",                                      department: "9100 Facilities",                 email: "mayan.goldman@forcepoint.com" },
      { name: "Heather Johnson",     role: "Sr. Director, People Rewards, Systems and Operations",         department: "5340 HR - Global Total Rewards",  email: "heather.johnson@forcepoint.com" },
      { name: "Peter Wilson",        role: "Sr. Manager, Cybersecurity Architecture & Security Operations", department: "2050 Solution Engineering",       email: "pwilson@forcepoint.com" },
      { name: "Michael Leach",       role: "Director, Global Compliance",                                  department: "5600 Legal",                      email: "michael.leach@forcepoint.com" }
    ],
    whatTheyDo: {
      lead: "AI Ambassadors help coordinate AI activity within a function.",
      points: [
        "Keep them in the loop on the AI projects you're working on — or vendor products with AI you'd like to use.",
        "Go to them with challenges you think AI could help improve.",
        "Ask questions and raise flags if you're not getting the results you need from AI. They can help you strategize or connect you with others who've faced the same challenges and solved them."
      ]
    },
    mission: [
      {
        title: "Overall Governance",
        points: [
          "Attend functional leadership meetings on a regular cadence",
          "Provide project & breakthrough updates",
          "Drive awareness of evolving needs",
          "Attend quarterly AI Council meetings",
          "Share function-level feedback to leadership and at quarterly AI Council meetings"
        ]
      },
      {
        title: "Grassroots Efforts",
        points: [
          "Be a go-to expert for AI questions",
          "Share knowledge across the function",
          "Champion team AI initiatives",
          "Scale promising individual work",
          "Escalate team work to function level",
          "Build energy & enthusiasm around the opportunities AI offers"
        ]
      },
      {
        title: "Vendor Applications",
        points: [
          "Work with platform owners on AI awareness",
          "Ensure AI Review Requests are sent",
          "Ensure approval requirements set by the AI Council are respected; set additional guardrails as needed",
          "Ensure the function uses AI tools successfully and appropriately, especially for complex matters with human-in-the-loop concerns",
          "Monitor value and resolve issues",
          "Provide feedback to the AI Council"
        ]
      },
      {
        title: "Orchestration Projects",
        points: [
          "Identify high-value repeat-work opportunities",
          "Develop business cases",
          "Work with teams to define workflows & hand-offs; guide them to viable solutions",
          "Organize solution testing",
          "Support workflow transformation",
          "Create or oversee change-management materials as needed",
          "Monitor and report on key metrics identified in the business case"
        ]
      }
    ]
  },

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
