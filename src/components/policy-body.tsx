import Markdown from "react-markdown";

export function PolicyBody({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-prose dark:prose-invert">
      <Markdown skipHtml>{content}</Markdown>
    </div>
  );
}
