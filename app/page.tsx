import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  const InfoCard = (
    <div className="p-[var(--spacing-l)] md:p-[var(--spacing-2xl)] 
      rounded-[var(--radius-m)] bg-[var(--neutral-n300)] w-full max-h-[85%] 
      overflow-hidden shadow-[var(--shadow-near)]"
    >
      <h1 className="text-[var(--display-s-size)] md:text-[var(--display-m-size)] 
        leading-[var(--display-s-line)] md:leading-[var(--display-m-line)]
        mb-[var(--spacing-l)] font-[var(--font-weight-bold)]
        text-[var(--text-heading)]"
      >
        ▲ Next.js + LangChain.js 🦜🔗
      </h1>
      <ul className="flex flex-col gap-[var(--spacing-m)]">
        <li className="text-[var(--body-l-size)] leading-[var(--body-l-line)]">
          🤝
          <span className="ml-[var(--spacing-s)]">
            This template showcases a simple chatbot using{" "}
            <a 
              href="https://js.langchain.com/" 
              target="_blank"
              className="text-[var(--text-active)] hover:text-[var(--primary-p400)]
                transition-colors"
            >
              LangChain.js
            </a>{" "}
            and the Vercel{" "}
            <a 
              href="https://sdk.vercel.ai/docs" 
              target="_blank"
              className="text-[var(--text-active)] hover:text-[var(--primary-p400)]
                transition-colors"
            >
              AI SDK
            </a>{" "}
            in a{" "}
            <a 
              href="https://nextjs.org/" 
              target="_blank"
              className="text-[var(--text-active)] hover:text-[var(--primary-p400)]
                transition-colors"
            >
              Next.js
            </a>{" "}
            project.
          </span>
        </li>
        <li className="hidden text-[var(--body-l-size)] leading-[var(--body-l-line)] md:block">
          💻
          <span className="ml-[var(--spacing-s)]">
            You can find the prompt and model logic for this use-case in{" "}
            <code className="bg-[var(--neutral-n900)] text-[var(--text-staticWhite)]
              px-[var(--spacing-s)] py-[var(--spacing-2xs)] rounded-[var(--radius-s)]"
            >
              app/api/chat/route.ts
            </code>.
          </span>
        </li>
        <li className="text-[var(--body-l-size)] leading-[var(--body-l-line)]">
          🏴‍☠️
          <span className="ml-[var(--spacing-s)]">
            By default, the bot is pretending to be a pirate, but you can change
            the prompt to whatever you want!
          </span>
        </li>
        <li className="hidden text-[var(--body-l-size)] leading-[var(--body-l-line)] md:block">
          🎨
          <span className="ml-[var(--spacing-s)]">
            The main frontend logic is found in{" "}
            <code className="bg-[var(--neutral-n900)] text-[var(--text-staticWhite)]
              px-[var(--spacing-s)] py-[var(--spacing-2xs)] rounded-[var(--radius-s)]"
            >
              app/page.tsx
            </code>.
          </span>
        </li>
        <li className="text-[var(--body-l-size)] leading-[var(--body-l-line)]">
          🐙
          <span className="ml-[var(--spacing-s)]">
            This template is open source - you can see the source code and
            deploy your own version{" "}
            <a
              href="https://github.com/langchain-ai/langchain-nextjs-template"
              target="_blank"
              className="text-[var(--text-active)] hover:text-[var(--primary-p400)]
                transition-colors"
            >
              from the GitHub repo
            </a>!
          </span>
        </li>
        <li className="text-[var(--body-l-size)] leading-[var(--body-l-line)]">
          👇
          <span className="ml-[var(--spacing-s)]">
            Try asking e.g.{" "}
            <code className="bg-[var(--neutral-n900)] text-[var(--text-staticWhite)]
              px-[var(--spacing-s)] py-[var(--spacing-2xs)] rounded-[var(--radius-s)]"
            >
              What is it like to be a pirate?
            </code> below!
          </span>
        </li>
      </ul>
    </div>
  );

  return (
    <ChatWindow
      endpoint="api/chat"
      emoji="🏴‍☠️"
      titleText="Patchy the Chatty Pirate"
      placeholder="I'm an LLM pretending to be a pirate! Ask me about the pirate life!"
      emptyStateComponent={InfoCard}
    />
  );
}