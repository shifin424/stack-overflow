import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import "highlight.js/styles/github-dark.css";

// Keep highlight.js class names (`hljs-*`, `language-*`) through sanitization.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^(hljs|language-)/]],
    span: [...(defaultSchema.attributes?.span ?? []), ["className", /^hljs/]],
  },
};

const Preview = ({ content }: { content: string }) => (
  <article className="markdown">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, schema], rehypeHighlight]}
    >
      {content}
    </ReactMarkdown>
  </article>
);

export default Preview;
