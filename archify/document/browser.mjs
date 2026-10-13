import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

// 每次加载都重建页面，执行检查不会把运行时生成的节点写入产物。
export async function documentBrowser(browser, designPath) {
  const session = await browser.sessionPromise;
  const errorKey = '__render_' + randomUUID().replaceAll('-', '');
  const run = async (expression) => {
    const result = await browser.cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, session);
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  return {
    run,
    errors: async () => await run('window[' + JSON.stringify(errorKey) + ']') || ['The page execution check could not be initialized.'],
    load: async (html, { scripts = false } = {}) => {
      await browser.cdp.send('Emulation.setScriptExecutionDisabled', { value: true }, session);
      let loaded = browser.cdp.waitFor('Page.loadEventFired', session); loaded.catch(() => {});
      const navigation = await browser.cdp.send('Page.navigate', { url: pathToFileURL(designPath).href }, session);
      if (navigation.errorText) throw new Error(navigation.errorText);
      await loaded;
      const { frameTree } = await browser.cdp.send('Page.getFrameTree', {}, session);
      if (scripts) {
        const probe = await run(`(() => {
          const doc = new DOMParser().parseFromString(${JSON.stringify(html)}, 'text/html');
          const script = doc.createElement('script');
          const key = ${JSON.stringify(errorKey)};
          script.textContent = 'window[' + JSON.stringify(key) + ']=[];addEventListener("error",event=>{if(event.message)window[' + JSON.stringify(key) + '].push(event.message)});addEventListener("unhandledrejection",event=>window[' + JSON.stringify(key) + '].push(String(event.reason)))';
          doc.head.prepend(script);
          return '<!doctype html>' + doc.documentElement.outerHTML;
        })()`);
        html = probe;
      }
      await browser.cdp.send('Emulation.setScriptExecutionDisabled', { value: !scripts }, session);
      loaded = browser.cdp.waitFor('Page.loadEventFired', session); loaded.catch(() => {});
      await browser.cdp.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html }, session);
      await loaded;
      if (scripts) await run('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    },
  };
}
