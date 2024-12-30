import { MCPService } from '../services/mcpService';

async function buildCorpus() {
  try {
    const mcpService = MCPService.getInstance();
    await mcpService.buildCorpus(false);
    console.log('Documentation corpus built successfully!');
  } catch (error) {
    console.error('Error building documentation corpus:', error);
    process.exit(1);
  }
}

buildCorpus();
