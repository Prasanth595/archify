import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { startPreview } from '../bin/preview.mjs';
import { runFinalize } from '../bin/finalize.mjs';
import { openLoopbackUrl } from '../bin/open-artifact.mjs';
import { resolveOutputPath, canonicalFuturePath } from '../renderers/shared/output-path.mjs';
import { captureAtomicOutput, captureRegularFileBinding, publishRegularFileBinding, releaseRegularFileBinding, removeOwnedRegularFile, quarantineRemoveRegularFileBinding } from '../renderers/shared/atomic-output.mjs';
import { checkEditScope, editableCollection, readEditScene, sameNativePage, appendEditorControls } from './model.mjs';
import { prepareEdits, proposeConnection } from './create.mjs';
import { linkedPages } from './linked-pages.mjs';
import { resolveCatalog } from '../renderers/shared/i18n.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const bytesAt = file => { try { return fs.readFileSync(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } };
const jsonBytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');
const equalBytes = (left, right) => left === null || right === null ? left === right : left.equals(right);

function publish(file, bytes, previous) {
  const capture = captureAtomicOutput(file, { requestedEntryPolicy: 'regular-or-absent' });
  if (capture.status !== 'captured') throw Error(`Cannot bind the save destination: ${capture.reason?.code || capture.status}`);
  const guard = () => {
    const current = bytesAt(file);
    if ((current ? digest(current) : null) !== (previous ? digest(previous) : null)) throw Error('The destination changed outside this session. Reload before saving.');
  };
  guard();
  const temporary = path.join(path.dirname(capture.commitPath), `.archify-edit-${randomUUID()}.tmp`);
  let identity, binding;
  try {
    fs.writeFileSync(temporary, bytes, { flag: 'wx', mode: capture.mode ?? 0o600 });
    const stat = fs.lstatSync(temporary, { bigint: true });
    identity = { device: stat.dev, inode: stat.ino };
    const held = captureRegularFileBinding(temporary, { expectedIdentity: identity, expectedSha256: digest(bytes), expectedBytes: bytes.length });
    if (held.status !== 'captured') throw Error('Could not bind the staged save.');
    binding = held.binding;
    guard();
    const saved = publishRegularFileBinding(binding, temporary, capture.snapshot, { subject: 'edit-save' });
    if (saved.status !== 'committed') throw Error(`Save publication: ${saved.cleanupState?.code || saved.reason?.code || saved.status}${saved.recoveryDirectory ? `; recovery: ${saved.recoveryDirectory}` : ''}`);
  } finally {
    const released = binding && releaseRegularFileBinding(binding);
    const removed = identity && removeOwnedRegularFile(temporary, identity);
    if (released && released.status !== 'released') throw Error('The save binding could not be released. Inspect the saved files before retrying.');
    if (removed && !['removed','absent','preserved'].includes(removed.status)) throw Error('The staged save could not be cleaned up.');
  }
}

function restore(file, previous, expected) {
  if (previous) return publish(file, previous, expected);
  const held = captureRegularFileBinding(file, { expectedSha256: digest(expected), expectedBytes: expected.length });
  if (held.status !== 'captured') throw Error('The newly published file changed before restoration.');
  try {
    const removed = quarantineRemoveRegularFileBinding(held.binding, file, { subject: 'edit-restore' });
    if (removed.status !== 'removed') throw Error('The new file could not be removed during restoration.');
  } finally { releaseRegularFileBinding(held.binding); }
}

export async function startEditor(options) {
  const type = options.type;
  editableCollection(type);
  const input = fs.realpathSync.native(path.resolve(options.input)), original = fs.readFileSync(input), source = JSON.parse(original);
  const quality = options.quality || source.meta?.quality_profile || 'standard';
  const output = canonicalFuturePath(resolveOutputPath({ requestedOutput: options.output, authoredOutput: source.meta?.output, inputPaths: [input], cwd: options.cwd || process.cwd() }).outputPath);
  resolveOutputPath({ requestedOutput: output.replace(/\.html?$/i, '.delivery.json'), inputPaths: [input], requiredExtension: '.json' });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const initialOutput = bytesAt(output);
  if (initialOutput?.includes('id="archify-story-payload"')) throw Error('This HTML has an attached story. Keep it intact and select a separate native output for adjustment.');
  const work = fs.mkdtempSync(path.join(fs.realpathSync.native(path.dirname(output)), '.archify-edit-'));
  const working = path.join(work, 'input.json');
  fs.writeFileSync(working, original, { mode: 0o600 });
  const token = randomUUID();
  let accepted = source, scene, artifact, revision = 0, busy = false, stopped = false;
  let originalBytes = original, outputBytes = initialOutput, selection = '';
  let impact = { changed: [], witnesses: [] };
  let resolveReady, rejectReady;
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  // Initial build failure is also visible through the preview state.
  ready.catch(() => {});
  let preview;
  let mainUrl = '';
  const links = await linkedPages(path.dirname(output),path.basename(output),()=>mainUrl);

  function config() {
    const {messages}=resolveCatalog(accepted.meta?.locale,accepted.meta?.translations);
    const editorMessages=Object.fromEntries(Object.entries(messages).filter(([key])=>key.startsWith('editor.')));
    return { token, revision, selection, scene, impact, canCreate:type==='architecture', editorMessages };
  }
  function initialFailure(message) {
    if (!scene) rejectReady(Error(message));
  }
  async function save(commands) {
    if (!Array.isArray(commands) || commands.length > 256) throw Error('Save requires a bounded list of connection adjustments.');
    if (!commands.length) return;
    const {source:next}=prepareEdits(accepted,type,scene,commands,quality);
    if (!equalBytes(bytesAt(input), originalBytes) || !equalBytes(bytesAt(output), outputBytes)) throw Error('The original source or HTML changed outside this session. Reload before saving.');
    const nextBytes = jsonBytes(next), deliveryPath = output.replace(/\.html?$/i, '.delivery.json');
    const oldDelivery = bytesAt(deliveryPath);
    let result;
    try {
      publish(input, nextBytes, originalBytes);
      result = await (options.finalize || runFinalize)({ cliPath: path.join(here, '../bin/archify.mjs'), type, input, output,
        candidateSha256: digest(nextBytes), quality,
        repoRoot: options.repoRoot, outDir: path.join(work, `checks-${revision}-${randomUUID()}`), cwd: options.cwd || process.cwd() });
      if (!result.receipt.ok) throw Error(result.receipt.diagnostics?.map(d => d.message).join('\n') || `Save failed at ${result.receipt.failedStage}.`);
      const html = fs.readFileSync(output);
      const nextScene = readEditScene(html);
      const nextImpact = checkEditScope(accepted,type,scene,nextScene,commands);
      if (!fs.readFileSync(input).equals(nextBytes)) throw Error('The source changed while saving.');
      originalBytes = nextBytes; outputBytes = html; artifact = html;
      accepted = next; scene = nextScene; impact = nextImpact; revision++;
      links.register(html);
    } catch (error) {
      const recoveryErrors = [];
      try {
        const delivered = result?.receipt.stages?.deliver?.receipt;
        const currentHtml = bytesAt(output), currentDelivery = bytesAt(deliveryPath);
        const htmlChanged = !equalBytes(currentHtml, outputBytes);
        const deliveryChanged = !equalBytes(currentDelivery, oldDelivery);
        if (htmlChanged || deliveryChanged) {
          if (!delivered || !currentDelivery || JSON.parse(currentDelivery).receiptId !== delivered.receiptId || digest(currentHtml) !== delivered.artifact.sha256) throw Error('The published output cannot be identified for restoration.');
          if (htmlChanged) restore(output, outputBytes, currentHtml);
          if (deliveryChanged) restore(deliveryPath, oldDelivery, currentDelivery);
        }
      } catch (rollback) {
        recoveryErrors.push(rollback.message);
      }
      try {
        const current = bytesAt(input);
        if (equalBytes(current, nextBytes)) publish(input, originalBytes, nextBytes);
        else if (!equalBytes(current, originalBytes)) throw Error('The source changed while saving and was preserved.');
      } catch (rollback) { recoveryErrors.push(rollback.message); }
      if (recoveryErrors.length) {
        let copyMessage;
        try {
          const recovery = path.join(work, `recovery-${randomUUID()}.json`);
          fs.writeFileSync(recovery, originalBytes, {flag:'wx', mode:0o600});
          copyMessage = `Recovery copy: ${recovery}`;
        } catch (copyError) { copyMessage = `Recovery copy could not be written: ${copyError.message}`; }
        error.message += ` Restoration incomplete: ${recoveryErrors.join('; ')}. ${copyMessage}`;
      }
      throw error;
    }
  }
  const editor = {
    pagePath: '/' + encodeURIComponent(path.basename(output)),
    linkedPage: url => links.redirect(url),
    decorate(buffer) {
      return appendEditorControls(artifact || buffer, `<script id="archify-edit-data" type="application/json">${safeJson(config())}</script><link rel="stylesheet" href="/edit/client.css"><script src="/edit/client.js"></script>`);
    },
    check(buffer, inputBytes) {
      if (!scene && initialOutput && !sameNativePage(buffer, initialOutput)) throw Error('The source and current renderer do not reproduce the existing HTML. Keep that file intact and choose a separate output, or use its matching source and renderer.');
      if (scene) throw Error('The working copy changed outside the connection editor.');
      if (!original.equals(inputBytes)) throw Error('The initial working copy changed during compilation.');
    },
    committed(buffer, inputBytes) {
      artifact = buffer; scene = readEditScene(buffer); accepted = JSON.parse(inputBytes);
      links.register(buffer);
      resolveReady();
    },
    failed: initialFailure,
    stop() { stopped = true; links.stop(); initialFailure('The editor session stopped.'); },
    async request(req, res, origin) {
      const send = (status, value, contentType = 'application/json; charset=utf-8') => {
        res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin' });
        res.end(contentType.startsWith('application/json') ? safeJson(value) : value);
      };
      const route = new URL(req.url, origin).pathname;
      if (req.method === 'GET' && ['/edit/client.js','/edit/client.css'].includes(route)) {
        return send(200, fs.readFileSync(path.join(here, path.basename(route))), route.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8');
      }
      if (req.method !== 'POST' || req.headers.origin !== origin || req.headers['x-archify-edit-token'] !== token || !req.headers['content-type']?.startsWith('application/json')) return send(403, { error: 'Forbidden edit request.' });
      if (stopped || busy) return send(409, { error: 'An edit or save is already running.' });
      busy = true;
      try {
        let body = '';
        req.setEncoding('utf8');
        for await (const part of req) { body += part; if (Buffer.byteLength(body) > 65536) throw Error('Edit request is too large.'); }
        const command = JSON.parse(body);
        if (command.revision !== revision) throw Error('This selection is from an older preview. Reload before editing.');
        await ready;
        if (route === '/edit/save') { selection = command.key || selection; await save(command.edits); }
        else if(route==='/edit/connect'){
          if(type!=='architecture')throw Error('New connections currently require an architecture diagram.');
          const draft=prepareEdits(accepted,type,scene,command.edits||[],quality);
          const proposal=proposeConnection(draft.source,draft.scene,command.connection,quality);
          send(200,{ok:true,...proposal});return;
        }
        else throw Error('Unknown edit operation.');
        send(200, { ok: true, ...config() });
      } catch (error) {
        const blocked = error.message.match(/crosses (?:component|node|entity|type) "([^"]+)"/);
        const labelConflict = /label-route-clearance|Labels .* overlap|Label .* overlaps/.test(error.message);
        const reason = blocked ? `The generated route crosses ${blocked[1]}. The rebuild could not keep the required clearance.`
          : labelConflict ? 'The generated diagram has a label-clearance conflict.'
          : /composition\/proper-crossing/.test(error.message) ? 'The renderer rejected a crossing after applying the route constraints.'
          : /outside this session/.test(error.message) ? 'The original file changed elsewhere. Reopen it before saving.'
          : 'The adjustments could not be saved. Review the draft or see the details.';
        send(409, { error: route==='/edit/connect'?'This connection cannot fit without changing the existing layout. Choose another free side or adjust a route first.':reason + ' Your draft is kept.', details:error.message });
      }
      finally { busy = false; }
    },
  };
  try {
    preview = await startPreview({ ...options, quality, input: working, output: path.join(work, 'preview.html'), open: false, editor });
    await ready;
    const url = new URL(editor.pagePath, preview.url).href; mainUrl = url;
    if (options.open !== false) openLoopbackUrl(url);
    return { url, input, output, work, state: () => config(), closed: Promise.all([preview.closed,links.closed]), stop: async (...args) => {await preview.stop(...args);await links.closed;} };
  } catch (error) { links.stop(); if (preview) await preview.stop(); await links.closed; throw error; }
}

export async function runEditor(options) {
  const editor = await startEditor(options);
  console.log(`edit ${editor.url}\nsource ${editor.input}\noutput ${editor.output}`);
  console.log('Turn on Draft in the top-right controls, then select a connection. Save from Export.');
  let stopCount = 0;
  const stop = () => editor.stop({ force: ++stopCount > 1 });
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
  await editor.closed;
  process.off('SIGINT', stop); process.off('SIGTERM', stop);
}
