const { createClient } = require("@supabase/supabase-js");
const { SupabaseVectorStore } = require("@langchain/community/vectorstores/supabase");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const fs = require('fs/promises');
const path = require('path');

// Configuration
const CONTENT_DIR = '../docs/docs/developers/api'; // Adjust this path to your .mdx files location
const FILE_EXTENSION = '.mdx';

async function countMdxFiles(directory) {
    const files = await fs.readdir(directory);
    return files.filter(file => file.endsWith(FILE_EXTENSION)).length;
}

async function processFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        const client = createClient(
            "https://godcbafbtnvzjmgjwpak.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZGNiYWZidG52emptZ2p3cGFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUyNTk1NSwiZXhwIjoyMDUxMTAxOTU1fQ.xakdUHbeomJ8HeIte-WekChCz4T3I7GaKcOlB5H34wI"
        );

        const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
            chunkSize: 256,
            chunkOverlap: 20,
        });

        const splitDocuments = await splitter.createDocuments([content]);

        await SupabaseVectorStore.fromDocuments(
            splitDocuments,
            new OpenAIEmbeddings(),
            {
                client,
                tableName: "documents",
                queryName: "match_documents",
            }
        );

        console.log(`Successfully processed: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return false;
    }
}

async function main() {
    try {
        const directory = path.resolve(__dirname, CONTENT_DIR);
        const remainingFiles = await countMdxFiles(directory);
        
        if (remainingFiles === 0) {
            console.log('No .mdx files found to process.');
            return;
        }

        console.log(`Found ${remainingFiles} .mdx files to process.`);
        
        const files = await fs.readdir(directory);
        const mdxFiles = files.filter(file => file.endsWith(FILE_EXTENSION));
        
        for (const file of mdxFiles) {
            const filePath = path.join(directory, file);
            await processFile(filePath);
        }

        console.log('All files have been processed.');
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

main();