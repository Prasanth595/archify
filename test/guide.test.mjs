import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCENARIO_RECIPES,
  listScenarioRecipes,
  publicGuideData,
  recommendScenario,
} from '../archify/recipes/scenarios.mjs';

test('guide: exposes unique recipes across the supported guide diagram types', () => {
  assert.equal(new Set(SCENARIO_RECIPES.map((recipe) => recipe.id)).size, SCENARIO_RECIPES.length);
  for (const type of ['architecture', 'workflow', 'sequence', 'dataflow', 'lifecycle', 'erd']) {
    assert.ok(SCENARIO_RECIPES.some((recipe) => recipe.type === type), type);
  }
});

test('guide: every recipe has complete decision copy', () => {
  for (const recipe of SCENARIO_RECIPES) {
    assert.match(recipe.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(recipe.signals.length > 0, recipe.id);
    assert.ok(['classic', 'signal-flow', 'blueprint', 'editorial'].includes(recipe.presentation.preset), recipe.id);
    const copy = recipe.en;
    assert.ok(copy.title.trim(), `${recipe.id}.title`);
    for (const field of ['question', 'summary', 'useWhen', 'avoidWhen', 'prompt']) {
      assert.ok(copy[field].trim(), `${recipe.id}.${field}`);
    }
    assert.ok(copy.include.length > 0 && copy.include.every((entry) => entry.trim()), `${recipe.id}.include`);
    assert.equal(recipe.zh, undefined, recipe.id);
  }
});

test('guide: listing is deterministic and English-only', () => {
  const listed = listScenarioRecipes();
  assert.equal(listed.length, SCENARIO_RECIPES.length);
  for (const recipe of SCENARIO_RECIPES) {
    assert.equal(listed.find((entry) => entry.id === recipe.id)?.title, recipe.en.title);
  }
  for (const recipe of SCENARIO_RECIPES) {
    assert.doesNotMatch(JSON.stringify(recipe), /[\u3400-\u9fff]/u, recipe.id);
  }
});

test('guide: representative scenarios map to specialized recipes', () => {
  const cases = [
    ['Show an API request with Redis cache miss', 'api-request'],
    ['Show CI/CD build deploy rollback', 'delivery-workflow'],
    ['Show Kafka topics, consumer groups and a dead-letter queue', 'event-stream'],
    ['Trace ETL warehouse PII data lineage', 'data-lineage'],
    ['deployment lifecycle approval rollback state', 'deployment-lifecycle'],
    ['agent tool call approval gate MCP', 'agent-tool-call'],
    ['Show a system overview via an architecture diagram', 'system-overview'],
    ['Draw deployment topology with named boundary crossings', 'deployment-ownership'],
    ['Explain an API request via a webhook callback', 'async-roundtrip'],
  ];

  for (const [query, expected] of cases) {
    assert.equal(recommendScenario(query).recommendation.id, expected, query);
  }
});

test('guide: repair questions select actionable repair guidance', () => {
  const queries = [
    'viewport overflow', 'why does it still overflow', 'scrollHeight', 'scrollWidth',
    'overlap', 'label overlap', 'edge through node', 'crossing', 'via',
    'how do via waypoints work', 'layout repair', 'which fix order', 'repair order',
    'architecture label overlap', 'workflow layout repair', 'sequence viewport overflow',
    'dataflow edge through node', 'lifecycle layout repair',
  ];
  for (const query of queries) {
    const result = recommendScenario(query);
    assert.equal(result.recommendation.id, 'layout-repair', query);
    assert.notEqual(result.confidence, 'low', query);
    assert.ok(result.matchedSignals.length > 0, query);
  }
});

test('guide: repair recipe supports exact selection', () => {
  const exact = recommendScenario('layout-repair');
  assert.equal(exact.recommendation.id, 'layout-repair');
  assert.equal(exact.confidence, 'high');
  assert.equal(exact.lang, undefined);
  assert.equal(recommendScenario('viewport overflow').recommendation.prompt, exact.recommendation.prompt);
});

test('guide: exact ids win and unknown questions fall back honestly', () => {
  const exact = recommendScenario('incident-runbook');
  assert.equal(exact.recommendation.id, 'incident-runbook');
  assert.equal(exact.confidence, 'high');

  const unknown = recommendScenario('make it delightful');
  assert.equal(unknown.recommendation.id, 'system-overview');
  assert.equal(unknown.confidence, 'low');
  assert.deepEqual(unknown.matchedSignals, []);
});

test('guide: public data includes English copy and weighted signals', () => {
  const data = publicGuideData();
  for (const recipe of data) {
    assert.ok(recipe.en.title);
    assert.equal(recipe.zh, undefined);
    assert.ok(recipe.proof, `${recipe.id}: verified proof is required`);
    assert.ok(recipe.signals.every(([signal, weight]) => typeof signal === 'string' && weight > 0));
  }
});
