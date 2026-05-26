// Predefined list of skills and technologies to scan for in Job Descriptions
const SKILLS_DATABASE = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'golang', 'go', 'rust', 'php', 'sql', 'html', 'css', 'swift', 'kotlin',
  // Frontend
  'react', 'angular', 'vue', 'next\\.js', 'nextjs', 'nuxt', 'vite', 'tailwind', 'bootstrap', 'sass', 'jquery', 'redux',
  // Backend & Databases
  'node\\.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'spring boot', 'springboot', 'laravel', 'fastapi',
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'firebase', 'graphql', 'rest api', 'oracle',
  // DevOps & Cloud
  'docker', 'kubernetes', 'aws', 'amazon web services', 'gcp', 'google cloud', 'azure', 'git', 'github', 'jenkins', 'ci/cd', 'cicd', 'terraform',
  // Concepts & Others
  'data structures', 'algorithms', 'machine learning', 'deep learning', 'nlp', 'system design', 'agile', 'scrum', 'testing', 'jest', 'mocha', 'cypress'
];

/**
 * Extracts technologies found in a job description text.
 * @param {string} text - The raw text of the job description.
 * @returns {string[]} An array of identified unique skills.
 */
export const extractSkills = (text) => {
  if (!text || typeof text !== 'string') return [];

  const lowercaseText = text.toLowerCase();
  const foundSkills = new Set();

  SKILLS_DATABASE.forEach(skillPattern => {
    // Construct a regex with word boundaries to avoid false positives (e.g. "go" matching inside "google")
    // Special characters like c++ and next.js require escaping, which is handled in the database definition
    const regex = new RegExp(`\\b${skillPattern}\\b`, 'gi');
    if (regex.test(lowercaseText)) {
      // Normalize skill name for display (e.g., capitalize correctly)
      let displayName = skillPattern.replace('\\+', '+').replace('\\.', '.');
      // Capitalize first letter of each word for clean output
      displayName = displayName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      // Standardize name formatting
      if (displayName.toLowerCase() === 'nodejs') displayName = 'Node.js';
      if (displayName.toLowerCase() === 'nextjs') displayName = 'Next.js';
      if (displayName.toLowerCase() === 'javascript') displayName = 'JavaScript';
      if (displayName.toLowerCase() === 'typescript') displayName = 'TypeScript';
      if (displayName.toLowerCase() === 'mongodb') displayName = 'MongoDB';
      if (displayName.toLowerCase() === 'postgresql') displayName = 'PostgreSQL';
      if (displayName.toLowerCase() === 'rest api') displayName = 'REST API';
      if (displayName.toLowerCase() === 'cicd') displayName = 'CI/CD';
      
      foundSkills.add(displayName);
    }
  });

  return Array.from(foundSkills);
};
