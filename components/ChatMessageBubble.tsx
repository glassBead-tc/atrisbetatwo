import type { Message } from "ai/react";

export function ChatMessageBubble(props: { message: Message, aiEmoji?: string, sources: any[] }) {
  const colorClassName =
    props.message.role === "user" 
      ? "bg-[var(--primary-p300)] text-[var(--text-staticWhite)]" 
      : "bg-[var(--background-surface1)] text-[var(--text-default)]";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? "🧑" : props.aiEmoji;
  
  return (
    <div
      className={`${alignmentClassName} ${colorClassName} 
        rounded-[var(--radius-m)] px-[var(--spacing-l)] py-[var(--spacing-s)] 
        max-w-[80%] mb-[var(--spacing-2xl)] flex
        shadow-[var(--shadow-near)]`}
    >
      <div className="mr-[var(--spacing-s)]">
        {prefix}
      </div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span className="text-[var(--body-m-size)] leading-[var(--body-m-line)]">
          {props.message.content}
        </span>
        {props.sources && props.sources.length ? (
          <>
            <code className="mt-[var(--spacing-l)] mr-auto 
              bg-[var(--neutral-n900)] text-[var(--text-staticWhite)]
              px-[var(--spacing-s)] py-[var(--spacing-2xs)] 
              rounded-[var(--radius-s)]"
            >
              <h2 className="text-[var(--label-m-size)] leading-[var(--label-m-line)]
                font-[var(--font-weight-medium)]"
              >
                🔍 Sources:
              </h2>
            </code>
            <code className="mt-[var(--spacing-2xs)] mr-[var(--spacing-s)] 
              bg-[var(--neutral-n900)] text-[var(--text-staticWhite)]
              px-[var(--spacing-s)] py-[var(--spacing-2xs)] 
              rounded-[var(--radius-s)]
              text-[var(--body-xs-size)] leading-[var(--body-xs-line)]"
            >
              {props.sources?.map((source, i) => (
                <div className="mt-[var(--spacing-s)]" key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined && (
                    <div className="mt-[var(--spacing-2xs)] text-[var(--text-subdued)]">
                      Lines {source.metadata.loc.lines.from} to {source.metadata.loc.lines.to}
                    </div>
                  )}
                </div>
              ))}
            </code>
          </>
        ) : null}
      </div>
    </div>
  );
}