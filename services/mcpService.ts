import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';

// Define Zod schemas for validation
const DocMetadataSchema = z.object({
  id: z.string(),
  category_name: z.string(),
  tool_name: z.string(),
  doc_name: z.string(),
  doc_description: z.string(),
  tags: z.array(z.string()).optional(),
  unlisted: z.boolean().optional()
});

export class MCPService {
  private static instance: MCPService;
  private server: Server;
  private readonly docsDir: string;
  private readonly sidebarPath: string;
  private readonly corpusPath: string;

  private constructor() {
    this.docsDir = path.join(process.cwd(), 'docs/docs');
    this.sidebarPath = path.join(process.cwd(), 'docs/sidebars.js');
    this.corpusPath = path.join(process.cwd(), 'data/audius/audius_corpus.json');

    // Initialize MCP server
    this.server = new Server(
      {
        name: "audius-docs",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.initializeServer();
  }

  private initializeServer(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "build-corpus",
            description: "Build documentation corpus from MDX files",
            inputSchema: {
              type: "object",
              properties: {
                force: {
                  type: "boolean",
                  description: "Force rebuild even if corpus exists",
                },
              },
              required: [],
            },
          },
          {
            name: "query-docs",
            description: "Query the documentation corpus",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query",
                },
                category: {
                  type: "string",
                  description: "Optional category to search within",
                },
              },
              required: ["query"],
            },
          },
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === "build-corpus") {
          return await this.handleBuildCorpus(args);
        } else if (name === "query-docs") {
          return await this.handleQueryDocs(args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Invalid arguments: ${error.errors
              .map((e) => `${e.path.join(".")}: ${e.message}`)
              .join(", ")}`
          );
        }
        throw error;
      }
    });
  }

  private async handleBuildCorpus(args: any): Promise<any> {
    const force = args.force || false;
    
    try {
      await this.buildCorpus(force);
      const corpus = await this.loadCorpus();
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully built documentation corpus with ${corpus.documentation.metadata.totalDocs} documents`,
          },
        ],
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: [
          {
            type: "text",
            text: `Error building corpus: ${err.message}`,
          },
        ],
      };
    }
  }

  private async handleQueryDocs(args: any): Promise<any> {
    const { query, category } = args;
    
    try {
      const results = await this.queryCorpus(query, category);
      
      return {
        content: [
          {
            type: "text",
            text: results.join("\n\n"),
          },
        ],
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: [
          {
            type: "text",
            text: `Error querying corpus: ${err.message}`,
          },
        ],
      };
    }
  }

  public static getInstance(): MCPService {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService();
    }
    return MCPService.instance;
  }

  private async loadCorpus(): Promise<any> {
    try {
      const content = await fs.promises.readFile(this.corpusPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to load corpus');
    }
  }

  private async saveCorpus(corpus: any): Promise<void> {
    await fs.promises.writeFile(
      this.corpusPath,
      JSON.stringify(corpus, null, 2),
      'utf-8'
    );
  }

  public async connect(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Audius Docs MCP Server running on stdio");
  }

  async buildCorpus(force: boolean): Promise<void> {
    try {
      // 1. Load existing corpus to preserve endpoints
      const existingCorpus = await this.loadExistingCorpus();
      const corpus = {
        endpoints: existingCorpus.endpoints, // Preserve existing endpoints
        documentation: {
          categories: {
            learn: [],
            developers: [],
            sdk: [],
            distributors: [],
            node_operators: [],
            reference: []
          },
          metadata: {
            lastUpdated: new Date().toISOString(),
            totalDocs: 0,
            categories: [
              'learn',
              'developers',
              'sdk',
              'distributors', 
              'node_operators',
              'reference'
            ]
          }
        }
      };

      // 2. Get sidebar configuration
      const sidebarConfig = await this.fetchSidebarConfig();

      // 3. Process each category
      for (const category of Object.keys(corpus.documentation.categories)) {
        const docs = await this.processCategory(category, sidebarConfig[category]);
        corpus.documentation.categories[category] = docs;
      }

      // 4. Update metadata
      this.updateMetadata(corpus);

      // 5. Save corpus
      await this.saveCorpus(corpus);
    } catch (error) {
      console.error('Error building corpus:', error);
      throw error;
    }
  }

  private async loadExistingCorpus(): Promise<any> {
    try {
      const content = await fs.promises.readFile(this.corpusPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('No existing corpus found, creating new one');
      return { endpoints: [] };
    }
  }

  private async fetchSidebarConfig(): Promise<any> {
    try {
      const content = await fs.promises.readFile(this.sidebarPath, 'utf-8');
      // Remove module.exports and parse as JSON
      const configStr = content.replace(/module\.exports\s*=\s*/, '');
      return JSON.parse(configStr);
    } catch (error) {
      console.error('Error loading sidebar config:', error);
      return {};
    }
  }

  private async processCategory(
    categoryName: string,
    items: any[]
  ): Promise<any[]> {
    const processed: any[] = [];

    for (const item of items) {
      if (item.type === 'category') {
        const category: any = {
          name: item.label,
          items: [],
          subcategories: []
        };

        if (item.items) {
          const subItems = await this.processCategory(categoryName, item.items);
          category.subcategories = subItems;
        }

        processed.push(category);
      } else {
        const doc = await this.processDoc(item, categoryName);
        if (doc) {
          processed.push({
            name: doc.metadata.doc_name,
            items: [doc]
          });
        }
      }
    }

    return processed;
  }

  private async processDoc(docPath: string, category: string): Promise<any> {
    try {
      const fullPath = path.join(this.docsDir, docPath);
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
      
      // Parse frontmatter
      const metadata = this.parseFrontmatter(frontmatter, category, docPath);
      
      return {
        metadata,
        content: content.replace(/---\n[\s\S]*?\n---/, '').trim(), // Remove frontmatter
        path: docPath
      };
    } catch (error) {
      console.error(`Error processing doc ${docPath}:`, error);
      return null;
    }
  }

  private parseFrontmatter(frontmatter: string, category: string, docPath: string): any {
    const lines = frontmatter.split('\n');
    const metadata: Record<string, any> = {};
    
    lines.forEach(line => {
      const [key, ...values] = line.split(':').map(s => s.trim());
      if (key && values.length) {
        metadata[key] = values.join(':').replace(/^['"]|['"]$/g, '');
      }
    });

    return {
      id: `doc_${category}_${path.basename(docPath, '.mdx')}`,
      category_name: category,
      tool_name: 'Audius Docs',
      doc_name: metadata.title || path.basename(docPath, '.mdx'),
      doc_description: metadata.description || '',
      tags: metadata.tags ? metadata.tags.split(',').map((tag: string) => tag.trim()) : [],
      unlisted: metadata.unlisted === 'true'
    };
  }

  private updateMetadata(corpus: any): void {
    let totalDocs = 0;
    Object.values(corpus.documentation.categories).forEach(category => {
      totalDocs += this.countDocs(category);
    });

    corpus.documentation.metadata.totalDocs = totalDocs;
    corpus.documentation.metadata.lastUpdated = new Date().toISOString();
  }

  private countDocs(categories: any[]): number {
    let count = 0;
    categories.forEach(category => {
      count += category.items.length;
      if (category.subcategories) {
        count += this.countDocs(category.subcategories);
      }
    });
    return count;
  }

  private async queryCorpus(query: string, category: string): Promise<string[]> {
    // TO DO: implement query logic
    return [];
  }
}
