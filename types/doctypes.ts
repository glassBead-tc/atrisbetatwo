export interface DocParameter {
  name: string;
  type: string;
  description: string;
  default?: string;
}

export interface DocMetadata {
  id: string;
  category_name: string;
  tool_name: string;
  doc_name: string;
  doc_description: string;
  required_parameters?: DocParameter[];
  optional_parameters?: DocParameter[];
  tags?: string[];
  unlisted?: boolean;
}

export interface DocItem {
  metadata: DocMetadata;
  content: string;  // Raw MDX content
  path: string;     // Relative path in docs directory
}

export interface DocCategory {
  name: string;
  items: DocItem[];
  subcategories?: DocCategory[];
}

export interface DocsCorpus {
  endpoints: any[]; // Preserve existing endpoints array
  documentation: {
    categories: {
      learn: DocCategory[];
      developers: DocCategory[];
      sdk: DocCategory[];
      distributors: DocCategory[];
      node_operators: DocCategory[];
      reference: DocCategory[];
    };
    metadata: {
      lastUpdated: string;
      totalDocs: number;
      categories: string[];
    };
  };
}
