export interface Page {
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
  content?: Node[];
  /** Number of page views for the page */
  views: number;
  /** Only returned if access_token passed. True, if the target Telegraph account can edit the page */
  can_edit?: boolean;
}

export interface Node {
  tag: string;
  attrs?: Record<string, string>;
  children?: (Node | string)[];
}
