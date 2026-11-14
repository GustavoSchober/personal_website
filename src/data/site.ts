// Everything the pages say that is not long-form content. Projects and experience live in src/content/.

export const GITHUB_URL = 'https://github.com/'; // TODO: your personal GitHub profile
export const LINKEDIN_URL = 'https://www.linkedin.com/in/gustavo-gomes-schober';
export const CV_URL = '/cv.pdf';

/** What the on-screen keyboard understands; the suggestion bubble cycles through these in order. */
export const ROUTES: Record<string, string> = {
  experiences: '/experiences',
  projects: '/projects',
  github: GITHUB_URL,
  linkedin: LINKEDIN_URL,
  'curriculum vitae': CV_URL,
};

export const SPECS = [
  { label: 'Query latency', value: -40, suffix: '%' },
  { label: 'Users served', value: 80, suffix: '+' },
  { label: 'Manual work saved', value: 12, suffix: ' h' },
  { label: 'Incident MTTR', value: -25, suffix: '%' },
];

export const STACK_DIFF = [
  { added: true, name: 'airflow' },
  { added: true, name: 'pyspark' },
  { added: true, name: 'dbt' },
  { added: true, name: 'snowflake' },
  { added: false, name: 'excel vba' },
];

export const COMMITS = [
  { hash: 'a3f9c1e', type: 'docs', msg: 'B.S. in Information Systems', meta: 'Dec 2025', head: true },
  { hash: '7b2e04d', type: 'perf', msg: 'analytical queries up to 40% faster', meta: '2025 · Oracle, PostgreSQL, SQL Server' },
  { hash: '19fe7b0', type: 'fix', msg: 'desync between critical REST integrations, validated in production', meta: '2025' },
  { hash: 'c81d5aa', type: 'feat', msg: 'standardized KPIs in dbt + Metabase for 80+ users', meta: '2025 · Snowflake, Databricks' },
  { hash: '5e1b77f', type: 'feat', msg: 'Airflow + PySpark pipelines in production', meta: 'Jun 2025 · Data Analyst' },
  { hash: 'e04c2b9', type: 'chore', msg: '−12 h/week of manual work with pandas', meta: '2024 · IT Intern' },
  { hash: 'd00a113', type: 'init', msg: 'first commit in data', meta: 'Nov 2024' },
];

/** Shown as −40% rather than -40%. */
export const formatSpec = (value: number, suffix: string) => (value < 0 ? `−${Math.abs(value)}` : `${value}`) + suffix;
