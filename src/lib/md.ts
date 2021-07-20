import { readFileSync } from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
  Blockquote,
  Code,
  Emphasis,
  Heading,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Node,
  Root,
  Strong,
  ThematicBreak,
} from 'mdast-util-from-markdown/lib';

import { TelegraphChild, TelegraphNode } from './types';

export const parseMarkdownFile = (filePath: string): TelegraphChild[] => {
  const content = readFileSync(filePath, 'utf-8');
  return parseMarkdownStr(content);
};

export const parseMarkdownStr = (content: string): TelegraphChild[] => {
  const ast = markdownStrToAst(content);
  return ast.children.map(astToTelegraphNode);
};

const astToTelegraphNode = (val: Node): TelegraphNode | string => {
  switch (val.type) {
    case 'text':
      return val.value;
    case 'paragraph':
      return { tag: 'p', children: val.children.map(astToTelegraphNode) };
    case 'heading':
      return headingToNode(val);
    case 'link':
      return linkToNode(val);
    case 'image':
      return imageToNode(val);
    case 'strong':
      return strongToNode(val);
    case 'emphasis':
      return emphasisToNode(val);
    case 'blockquote':
      return blockquoteToNode(val);
    case 'list':
      return listToNode(val);
    case 'listItem':
      return listItemToNode(val);
    case 'code':
      return codeToNode(val);
    case 'inlineCode':
      return inlineCodeToNode(val);
    case 'thematicBreak':
      return thematicBreakToNode(val);
  }
  return `${JSON.stringify(val)}`;
};

const headingToNode = (val: Heading): TelegraphNode => {
  const { depth } = val;
  if (depth <= 3) return { tag: 'h3', children: val.children.map(astToTelegraphNode) };
  else return { tag: 'h4', children: val.children.map(astToTelegraphNode) };
};

const imageToNode = ({ url, alt }: Image): TelegraphNode => {
  const children: TelegraphNode[] = [{ tag: 'img', attrs: { src: url } }];
  if (alt) {
    children.push({ tag: 'figcaption', children: [alt] });
  }
  return { tag: 'figure', children };
};

const linkToNode = (val: Link): TelegraphNode => ({
  tag: 'a',
  attrs: { href: val.url, target: '_blank' },
  children: val.children.map(astToTelegraphNode),
});

const strongToNode = (val: Strong): TelegraphNode => ({
  tag: 'strong',
  children: val.children.map(astToTelegraphNode),
});

const emphasisToNode = (val: Emphasis): TelegraphNode => ({
  tag: 'em',
  children: val.children.map(astToTelegraphNode),
});

const blockquoteToNode = (val: Blockquote): TelegraphNode => ({
  tag: 'blockquote',
  children: val.children.map(astToTelegraphNode),
});

const listToNode = (val: List): TelegraphNode => {
  const tag = val.ordered ? 'ol' : 'ul';
  return { tag, children: val.children.map(astToTelegraphNode) };
};

const listItemToNode = (val: ListItem): TelegraphNode => ({
  tag: 'li',
  children: val.children.map(astToTelegraphNode),
});

const codeToNode = (val: Code): TelegraphNode => ({
  tag: 'pre',
  children: [val.value],
  attrs: val.lang ? { class: val.lang } : undefined,
});

const inlineCodeToNode = (val: InlineCode): TelegraphNode => ({
  tag: 'code',
  children: [val.value],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const thematicBreakToNode = (val: ThematicBreak): TelegraphNode => ({
  tag: 'hr',
});

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call
const markdownStrToAst = (val: string): Root => fromMarkdown(val) as unknown as Root;
