import { parseMarkdownStr } from './md';

describe('parseMarkdownStr', () => {
  it('should parse heading', () => {
    expect(parseMarkdownStr('# Hello')).toEqual([{ tag: 'h1', children: ['Hello'] }]);
    expect(parseMarkdownStr('###### Hello')).toEqual([{ tag: 'h6', children: ['Hello'] }]);
  });

  it('should parse paragraph', () => {
    expect(parseMarkdownStr('Text')).toEqual([{ tag: 'p', children: ['Text'] }]);
    expect(parseMarkdownStr('Text [Link](https://some.com/) Text')).toEqual([
      {
        tag: 'p',
        children: ['Text ', { tag: 'a', attrs: { href: 'https://some.com/', target: '_blank' }, children: ['Link'] }, ' Text'],
      },
    ]);
  });

  it('should parse images', () => {
    expect(parseMarkdownStr('![Cool image](https://some.com/img.jpg)')).toEqual([
      {
        tag: 'p',
        children: [
          {
            tag: 'figure',
            children: [
              { tag: 'img', attrs: { src: 'https://some.com/img.jpg' } },
              { tag: 'figcaption', children: ['Cool image'] },
            ],
          },
        ],
      },
    ]);
  });

  it('should parse strong', () => {
    expect(parseMarkdownStr('**strong**')).toEqual([{ tag: 'p', children: [{ tag: 'strong', children: ['strong'] }] }]);
  });

  it('should parse italic', () => {
    expect(parseMarkdownStr('*italic*')).toEqual([{ tag: 'p', children: [{ tag: 'em', children: ['italic'] }] }]);
  });

  it('should parse blockquote', () => {
    expect(parseMarkdownStr('> blockquote')).toEqual([{ tag: 'blockquote', children: [{ tag: 'p', children: ['blockquote'] }] }]);
  });

  it('should parse ordered list', () => {
    expect(parseMarkdownStr('1. One\n2. Two')).toEqual([
      {
        tag: 'ol',
        children: [
          { tag: 'li', children: [{ tag: 'p', children: ['One'] }] },
          { tag: 'li', children: [{ tag: 'p', children: ['Two'] }] },
        ],
      },
    ]);
  });

  it('should parse unordered list', () => {
    expect(parseMarkdownStr('- One\n- Two')).toEqual([
      {
        tag: 'ul',
        children: [
          { tag: 'li', children: [{ tag: 'p', children: ['One'] }] },
          { tag: 'li', children: [{ tag: 'p', children: ['Two'] }] },
        ],
      },
    ]);
  });

  it('should parse code', () => {
    expect(parseMarkdownStr('```\nCode\n```')).toEqual([{ tag: 'pre', children: ['Code'] }]);
  });

  it('should parse inline conde', () => {
    expect(parseMarkdownStr('`Code`')).toEqual([{ tag: 'p', children: [{ tag: 'code', children: ['Code'] }] }]);
  });
});
