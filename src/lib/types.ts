export interface TelegraphPage {
  /** Path to the page */
  path: string;
  /** URL of the page */
  url: string;
  /** Title of the page */
  title: string;
  /** Description of the page */
  description: string;
  /** Name of the author, displayed below the title */
  author_name?: string;
  /**
   * Profile link, opened when users click on the author's name below the title.
   * Can be any link, not necessarily to a Telegram profile or channel
   */
  author_url?: string;
  /** Image URL of the page */
  image_url?: string;
  /** Content of the page */
  content?: TelegraphNode[];
  /** Number of page views for the page */
  views: number;
  /** Only returned if access_token passed. True, if the target Telegraph account can edit the page */
  can_edit?: boolean;
}

export interface TelegraphNode {
  tag: string;
  attrs?: Record<string, string>;
  children?: TelegraphChild[];
}

export type TelegraphChild = TelegraphNode | string;

/**
  # Examples

  YoutTube with caption

  {
    "tag": "figure",
    "children": [
      {
        "tag": "iframe",
        "attrs": {
          "src": "/embed/youtube?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D6_CIolfOf3w%26t%3D185s",
          "width": "640",
          "height": "360",
          "frameborder": "0",
          "allowtransparency": "true",
          "allowfullscreen": "true",
          "scrolling": "no"
        }
      },
      {
        "tag": "figcaption",
        "children": [
          "Some caption"
        ]
      }
    ]
  }

 */
