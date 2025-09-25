import React from 'react';
import ReactMarkdown from 'react-markdown';

function MarkdownRenderer({ children }: {
    children: string
}) {
    return (
        <div>
            <ReactMarkdown>{children}</ReactMarkdown>
        </div>
    );
}

export default MarkdownRenderer;