#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseSemver, validateLocalRelease } from '../archify/scripts/update-contract.mjs';

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootFlag = process.argv.indexOf('--root');
const repoRoot = rootFlag === -1 ? scriptRoot : path.resolve(process.argv[rootFlag + 1] || '');
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
  } catch {
    fail(`${relativePath} is missing or unreadable.`);
    return '';
  }
}

function readJson(relativePath) {
  const source = read(relativePath);
  if (!source) return {};
  try {
    return JSON.parse(source);
  } catch {
    fail(`${relativePath} is not valid JSON.`);
    return {};
  }
}

function checkSkillRelease(value, version, isDevelopment) {
  const expectedChannel = isDevelopment ? 'development' : 'stable';
  try {
    const release = validateLocalRelease(value);
    if (release.version === version && release.channel === expectedChannel) return;
  } catch {
    // Report the repository-specific cross-artifact requirement below.
  }
  fail(`archify/skill-release.json must identify archify ${version} as ${expectedChannel}, use the official repository, and pin the trusted update manifest URL.`);
}

const packageJson = readJson('archify/package.json');
const version = packageJson.version;
let parsedVersion = null;
try {
  parsedVersion = parseSemver(version);
} catch {
  // The consolidated error below owns package-version policy reporting.
}
const supportedPrerelease = parsedVersion?.prerelease === null
  || (parsedVersion?.prerelease?.length === 2
    && parsedVersion.prerelease[0] === 'dev'
    && /^\d+$/.test(parsedVersion.prerelease[1]));
const hasSupportedVersion = Boolean(parsedVersion && parsedVersion.build === null && supportedPrerelease);
const isDevelopment = Boolean(hasSupportedVersion && parsedVersion.prerelease);

if (!hasSupportedVersion) {
  fail(`package version is not a supported SemVer identity: ${JSON.stringify(version)}`);
} else {
  checkSkillRelease(readJson('archify/skill-release.json'), version, isDevelopment);

  const lock = readJson('archify/package-lock.json');
  if (lock.version !== version || lock.packages?.['']?.version !== version) {
    fail(`archify/package-lock.json must match ${version} at the root and packages[""].`);
  }

  const skill = read('archify/SKILL.md');
  const skillVersion = skill.match(/^\s*version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];
  const expectedSkillVersion = `${parsedVersion.core[0]}.${parsedVersion.core[1]}`;
  if (skillVersion !== expectedSkillVersion) {
    fail(`archify/SKILL.md metadata version ${skillVersion || '(missing)'} must map to package ${version} as ${expectedSkillVersion}.`);
  }

  const rendererTemplate = read('archify/assets/template.html');
  const generatorVersions = [...rendererTemplate.matchAll(/<meta\s+name="generator"\s+content="archify\s+([^"]+)"\s*\/?>/g)]
    .map((match) => match[1]);
  if (generatorVersions.length !== 1 || generatorVersions[0] !== version) {
    fail(`archify/assets/template.html generator must be archify ${version}; found ${generatorVersions.join(', ') || '(missing)'}.`);
  }
}

if (failures.length > 0) {
  for (const message of failures) console.error(`release identity: ${message}`);
  process.exit(1);
}

console.log(`release identity ok: ${version}`);
