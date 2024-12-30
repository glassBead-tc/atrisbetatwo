import { useState } from "react";
import type { Message } from "ai/react";

export function IntermediateStep(props: { message: Message }) {
  const parsedInput = JSON.parse(props.message.content);
  const action = parsedInput.action;
  const observation = parsedInput.observation;
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`ml-auto bg-[var(--special-aiGreen)] rounded-[var(--radius-m)] 
      px-[var(--spacing-l)] py-[var(--spacing-s)] max-w-[80%] mb-[var(--spacing-2xl)] 
      whitespace-pre-wrap flex flex-col cursor-pointer`}
    >
      <div 
        className={`text-right ${expanded ? "w-full" : ""}`} 
        onClick={(e) => setExpanded(!expanded)}
      >
        <code className="mr-[var(--spacing-s)] bg-[var(--neutral-n900)] 
          px-[var(--spacing-s)] py-[var(--spacing-2xs)] rounded-[var(--radius-s)] 
          hover:text-[var(--special-blue)]"
        >
          🛠️ <b>{action.name}</b>
        </code>
        <span className={expanded ? "hidden" : ""}>🔽</span>
        <span className={expanded ? "" : "hidden"}>🔼</span>
      </div>
      <div className={`overflow-hidden max-h-[0px] transition-[max-height] ease-in-out 
        ${expanded ? "max-h-[360px]" : ""}`}
      >
        <div className={`bg-[var(--neutral-n900)] rounded-[var(--radius-m)] 
          p-[var(--spacing-l)] mt-[var(--spacing-2xs)] max-w-0 
          ${expanded ? "max-w-full" : "transition-[max-width] delay-100"}`}
        >
          <code className={`opacity-0 max-h-[100px] overflow-auto transition 
            ease-in-out delay-150 ${expanded ? "opacity-100" : ""}`}
          >
            Tool Input:
            <br></br>
            <br></br>
            {JSON.stringify(action.args)}
          </code>
        </div>
        <div className={`bg-[var(--neutral-n900)] rounded-[var(--radius-m)] 
          p-[var(--spacing-l)] mt-[var(--spacing-2xs)] max-w-0 
          ${expanded ? "max-w-full" : "transition-[max-width] delay-100"}`}
        >
          <code className={`opacity-0 max-h-[260px] overflow-auto transition 
            ease-in-out delay-150 ${expanded ? "opacity-100" : ""}`}
          >
            {observation}
          </code>
        </div>
      </div>
    </div>
  );
}
