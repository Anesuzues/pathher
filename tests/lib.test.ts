import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankCareerPaths, getPrimaryPath } from '../src/lib/recommend.ts';
import { CAREER_PATHS, KNOBZ_CERTIFICATES, MELSOFT_PROGRAMMES, getCertificate } from '../src/constants.ts';
import { isValidEmail, isValidName, readJSON, readStringList } from '../src/lib/utils.ts';

test('every career path points at a real certificate, and programmes at real paths', () => {
  const pathIds = CAREER_PATHS.map(p => p.id);
  assert.equal(new Set(pathIds).size, pathIds.length);
  for (const path of CAREER_PATHS) assert.ok(getCertificate(path.certificate), path.id);
  assert.equal(KNOBZ_CERTIFICATES.length, 4);
  for (const programme of MELSOFT_PROGRAMMES) {
    for (const id of programme.careerPaths) assert.ok(pathIds.includes(id), `${programme.id} -> ${id}`);
  }
});

test('rankCareerPaths follows the answers', () => {
  const top = (profile: object) => rankCareerPaths(profile)[0].id;
  assert.equal(top({ interests: ['Business', 'Marketing'], strengths: ['Communication'], goals: ['Stability'] }), 'ai-digital-professional');
  assert.equal(top({ interests: ['Arts & Design'], strengths: ['Creativity'], education: 'High School Graduate' }), 'junior-software-developer');
  assert.equal(top({ interests: ['Science'], strengths: ['Writing', 'Analytical Thinking'], education: 'University Graduate' }), 'ai-enhanced-developer');
  assert.equal(top({ interests: ['Engineering'], strengths: ['Technical Skills'], goals: ['Entrepreneurship'], education: 'Working Professional' }), 'ai-application-developer');
});

test('rankCareerPaths always returns every path, even for broken profiles', () => {
  for (const profile of [null, undefined, {}, 'x', { interests: 'Technology', strengths: [5], goals: null }] as unknown[]) {
    const ranked = rankCareerPaths(profile);
    assert.equal(ranked.length, CAREER_PATHS.length);
    assert.deepEqual(ranked.map(p => p.id), CAREER_PATHS.map(p => p.id)); // all tied at 0 -> catalogue order
  }
});

test('getPrimaryPath prefers a saved path, then the best match', () => {
  const profile = { interests: ['Business'], strengths: ['Communication'] };
  assert.equal(getPrimaryPath(profile, ['ai-application-developer'])?.id, 'ai-application-developer');
  assert.equal(getPrimaryPath(profile, ['an-old-removed-path'])?.id, 'ai-digital-professional');
  assert.equal(getPrimaryPath(profile, [])?.id, 'ai-digital-professional');
  assert.equal(getPrimaryPath(null, []), undefined);
});

test('name and email validation', () => {
  assert.equal(isValidName('Thandi'), true);
  assert.equal(isValidName('   x'), false);
  assert.equal(isValidName(''), false);
  assert.equal(isValidEmail('thandi@example.com'), true);
  for (const bad of ['@', 'a@b', 'not-an-email', 'a b@c.com', '']) assert.equal(isValidEmail(bad), false, bad);
});

test('readJSON and readStringList survive corrupt localStorage', () => {
  const store: Record<string, string> = { good: '["a","b"]', corrupt: '{oops', mixed: '["a",1,null]', object: '{"a":1}' };
  (globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null };
  assert.deepEqual(readJSON('good', []), ['a', 'b']);
  assert.equal(readJSON('corrupt', 'fallback'), 'fallback');
  assert.equal(readJSON('missing', null), null);
  assert.deepEqual(readStringList('corrupt'), []);
  assert.deepEqual(readStringList('mixed'), ['a']);
  assert.deepEqual(readStringList('object'), []);
});

test('parseCertificateRows keeps good rows and rejects junk', async () => {
  const { parseCertificateRows, findCertificate } = await import('../src/lib/knobzCatalogue.ts');
  assert.equal(parseCertificateRows(null), null);
  assert.equal(parseCertificateRows([]), null);
  assert.equal(parseCertificateRows([{ number: 'x', title: 'T', description: 'D', level: 'Beginner' }]), null);
  const rows = parseCertificateRows([
    { number: 1, title: ' New title ', subtitle: null, description: 'Desc', level: 'Beginner', modules: 4 },
    { number: 2, title: 'Bad level', description: 'Desc', level: 'Expert' },
    { number: 6, title: 'Brand new', description: 'Desc', level: 'Advanced', modules: -1 },
  ]);
  assert.deepEqual(rows, [
    { number: 1, title: 'New title', subtitle: '', description: 'Desc', level: 'Beginner', modules: 4 },
    { number: 6, title: 'Brand new', subtitle: '', description: 'Desc', level: 'Advanced', modules: 0 },
  ]);
  // A certificate missing from the live list falls back to the built-in one.
  assert.equal(findCertificate(rows!, 3)?.title, KNOBZ_CERTIFICATES[2].title);
  assert.equal(findCertificate(rows!, 1)?.title, 'New title');
});

test('AI input is cleaned, prompts keep KnobzToLearn first, and replies are checked', async () => {
  const { cleanInput, buildPrompt, parseResult } = await import('../api/ai.ts');
  assert.equal(cleanInput(null), null);
  assert.equal(cleanInput({ path: {}, certificate: {} }), null);

  const input = cleanInput({
    profile: { firstName: 'Thandi\u0000', education: 'University Graduate', interests: ['Technology', 5], strengths: ['Writing'], goals: [], workStyle: [] },
    path: { title: 'AI-Enhanced Developer', skillsNeeded: ['Prompt Engineering'] },
    certificate: { number: 99, title: 'AI-Enhanced Developer', description: 'Testing and docs.' },
  })!;
  assert.equal(input.profile.firstName, 'Thandi');
  assert.deepEqual(input.profile.interests, ['Technology']);
  assert.equal(input.certificate.number, 1); // out-of-range numbers fall back to 1

  for (const task of ['career', 'branding'] as const) {
    const prompt = buildPrompt(task, input);
    assert.match(prompt, /KnobzToLearn certificate for this path: Certificate 1: AI-Enhanced Developer/);
    assert.match(prompt, /Interests: Technology/);
  }

  assert.equal(parseResult('career', 'not json'), null);
  assert.equal(parseResult('career', JSON.stringify({ whyItFits: 'x', encouragement: 'y', nextSteps: [] })), null);
  const career = parseResult('career', JSON.stringify({
    whyItFits: 'Fits you. See https://example.com now', encouragement: 'Go!', nextSteps: ['a', 'b', 'c', 'd'],
    networkingTip: 'tip', careerInsight: 'edge',
  })) as { whyItFits: string; nextSteps: string[] };
  assert.equal(career.whyItFits, 'Fits you. See  now'); // links are stripped
  assert.equal(career.nextSteps.length, 3);

  assert.equal(parseResult('branding', JSON.stringify({ cvSummary: 's', cvSkills: [], linkedinHeadline: 'h', linkedinAbout: 'a' })), null);
  assert.ok(parseResult('branding', JSON.stringify({ cvSummary: 's', cvSkills: ['k'], linkedinHeadline: 'h', linkedinAbout: 'a' })));
});

test('AI career steps never repeat the certificate step, and KnobzToLearn is spelled right', async () => {
  const { parseResult } = await import('../api/ai.ts');
  const r = parseResult('career', JSON.stringify({
    whyItFits: 'Study on KnobdToLearn and Knobz To Learn.', encouragement: 'Go!',
    nextSteps: ['Complete Certificate 2 on KnobzToLearn', 'Build a portfolio site', 'Practise daily'],
    networkingTip: 't', careerInsight: 'e',
  })) as { whyItFits: string; nextSteps: string[] };
  assert.deepEqual(r.nextSteps, ['Build a portfolio site', 'Practise daily']);
  assert.equal(r.whyItFits, 'Study on KnobzToLearn and KnobzToLearn.');
  // If every step was the certificate, there's nothing to show, so the reply is rejected.
  assert.equal(parseResult('career', JSON.stringify({ whyItFits: 'w', encouragement: 'e', nextSteps: ['Finish the certificate'] })), null);
});

test('AI daily limit: per-user per-day key and a sane default', async () => {
  const { usageKey, DAILY_LIMIT } = await import('../api/ai.ts');
  assert.equal(usageKey('abc', new Date('2026-11-11T23:59:00Z')), 'ai-usage:abc:2026-11-11');
  assert.equal(usageKey('abc', new Date('2026-11-12T00:00:00Z')), 'ai-usage:abc:2026-11-12');
  const prev = process.env.AI_DAILY_LIMIT;
  delete process.env.AI_DAILY_LIMIT;
  assert.equal(DAILY_LIMIT(), 10);
  process.env.AI_DAILY_LIMIT = '25';
  assert.equal(DAILY_LIMIT(), 25);
  process.env.AI_DAILY_LIMIT = 'nonsense';
  assert.equal(DAILY_LIMIT(), 10);
  if (prev === undefined) delete process.env.AI_DAILY_LIMIT; else process.env.AI_DAILY_LIMIT = prev;
});
