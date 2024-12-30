import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";



const graph = new StateGraph(MessagesAnnotation)
    .addNode()