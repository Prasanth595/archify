// 旧布局的开发样例；文档入口使用独立的 HTML 设计。
import { compile } from '../compile.mjs';
import { connect } from './slots.mjs';
import * as flat from './flat.mjs';
import * as article from './article.mjs';
import * as amSheet from './am-sheet.mjs';
import * as cards from './cards.mjs';

export const TEMPLATES = { flat, article, 'am-sheet': amSheet, cards };
export const TEMPLATE_NAMES = Object.keys(TEMPLATES);

export function buildExample(source, { title = 'document', template = 'flat', options = {} } = {}) {
  const chosen = TEMPLATES[template];
  if (!chosen) throw new Error('Unknown template "' + template + '". Expected one of: ' + TEMPLATE_NAMES.join(', '));
  const compiled = compile(source);
  const join = connect(chosen, compiled.blocks);
  const page = chosen.page({ ...compiled, join, title, sourceText: source, options });
  return { page, ...compiled };
}
