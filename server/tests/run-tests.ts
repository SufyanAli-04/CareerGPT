import { runTests as runProfileTests } from './deriveResumeJobProfile.test';

try {
  runProfileTests();
  console.log('\nAll unit tests passed');
  process.exit(0);
} catch (err) {
  console.error('Unit tests failed:', err);
  process.exit(1);
}
