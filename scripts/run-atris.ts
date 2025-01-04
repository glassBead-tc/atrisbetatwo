import { main } from '../graphs/atrisrevision';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Example queries to test the system
const testQueries = [
    "What are the top 10 trending tracks on Audius?",
    "What is the Audius protocol?"
];

// Run the main function with test queries
async function runTest() {
    try {
        await main(testQueries);
    } catch (error) {
        console.error('Error running atrisrevision:', error);
    }
}

runTest();
