import { readFileSync } from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { Node, Root } from 'mdast-util-from-markdown/lib';

import { TelegraphNode } from './types';

export const parseMarkdownFile = (filePath: string): (TelegraphNode | string)[] => {
  const str = readFileSync(filePath, 'utf-8');
  const data = mdStrToAst(str);
  if (!data) return [];
  return data.children.map(astToTelegraphNode);
};

const astToTelegraphNode = (val: Node): TelegraphNode | string => {
  switch (val.type) {
    case 'text':
      return val.value;
    case 'paragraph':
      return { tag: 'p', children: val.children.map(astToTelegraphNode) };
    case 'heading':
      return { tag: headingDepthToTag(val.depth), children: val.children.map(astToTelegraphNode) };
    case 'link':
      return { tag: 'a', attrs: { href: val.url, target: '_blank' }, children: val.children.map(astToTelegraphNode) };
    case 'image':
      return { tag: 'figure', children: [{ tag: 'img', attrs: { src: val.url } }] };
  }
  return '';
};

type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6;

const headingDepthToTag = (depth: HeadingDepth): string => `h${depth}`;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call
const mdStrToAst = (val: string): Root | undefined => fromMarkdown(val) as unknown as Root;
