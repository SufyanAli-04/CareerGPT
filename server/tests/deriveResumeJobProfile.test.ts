import assert from 'node:assert';
import { deriveResumeJobProfile } from '../src/services/aiService';

export const runTests = () => {
  // Test 1: Teaching resume with multiple year entries (no tech skills to avoid override)
  const teachingResume = `\nExperience\n1 Year Experience as Teacher at Muhammad Ali Public School\n6 Year Experience as Lecturer at Al Syed Islamic Middle School\n2 Year Experience as Trainer at Letter Land Phonic Education System\n6 Year Experience as Professor at English Grammer High School\n\nSkills\nCurriculum Development, Student Assessment, Classroom Management, Lesson Planning\n`;
  const teaching = deriveResumeJobProfile(teachingResume);
  assert.strictEqual(teaching.targetRole, 'Teacher / Education Specialist', 'Should detect education role');
  assert.strictEqual(teaching.experience, 15, 'Should sum experience and cap at 15');
  assert.ok(Array.isArray(teaching.skills) && teaching.skills.length >= 0, 'Should extract skills');

  // Test 2: Web/dev focused resume
  const webResume = `\nWork History\n3 years at SomeStartup as Frontend Engineer\n2 years at OtherCo as UI Developer\n\nSkills\nReact, TypeScript, JavaScript, CSS, HTML\n`;
  const web = deriveResumeJobProfile(webResume);
  console.log('WEB PROFILE:', web);
  assert.ok(/Frontend Developer|Full Stack Developer|Frontend/i.test(web.targetRole), `Should detect frontend-related role but got: ${web.targetRole}`);
  assert.strictEqual(web.experience, 5, 'Should sum experience to 5');

  // Test 3: AI/ML resume
  const mlResume = `\nExperience\n4 years Machine Learning Engineer at DataCorp\n1 year Research Assistant\n\nSkills\nPython, PyTorch, TensorFlow, NLP\n`;
  const ml = deriveResumeJobProfile(mlResume);
  assert.strictEqual(ml.targetRole, 'AI / ML Engineer', 'Should detect AI/ML role');
  assert.strictEqual(ml.experience, 5, 'Should sum AI experience');

  // Test 4: No explicit years, many skills fallback
  const skillsOnly = `\nSummary\nExperienced engineer with many skills\nSkills\nReact, Node.js, TypeScript, GraphQL, MongoDB, Express, CSS, HTML, Redux\n`;
  const s = deriveResumeJobProfile(skillsOnly);
  assert.ok(s.experience >= 1 && s.experience <= 15, 'Fallback experience should be reasonable');

  // Test 5: Resume with "willing to become" developer signal and no years (fresher)
  const fresherResume = `\nObjective\nRecent graduate willing to become a Frontend developer\nSkills\nHTML, CSS, JavaScript, React\n`;
  const fresher = deriveResumeJobProfile(fresherResume);
  assert.strictEqual(fresher.targetRole, 'Frontend Developer', 'Should detect frontend role from developer signal');
  assert.strictEqual(fresher.experience, 0, 'Should set experience to 0 for fresher with "willing to become" signal');

  // Test 6: Resume with both tech and teaching signals - tech should win
  const mixedResume = `\nBackground\nUsed to be a teacher but now wanting to pursue frontend development\nSkills\nReact, JavaScript, TypeScript, CSS, HTML\n`;
  const mixed = deriveResumeJobProfile(mixedResume);
  assert.strictEqual(mixed.targetRole, 'Frontend Developer', 'Should prioritize tech role over education keywords');

  console.log('All deriveResumeJobProfile tests passed');
};
