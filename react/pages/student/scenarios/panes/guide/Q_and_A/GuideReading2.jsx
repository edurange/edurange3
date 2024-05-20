import React from 'react';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';
import './Q_and_A.css';
import '@assets/css/markdown.css';

function GuideReading2({ readingObj }) {
    console.log('reading obj in gr2: ', readingObj);

    const this_content = readingObj?.content;
    const this_styles = readingObj?.styles || [];

    // Generate a dynamic style object based on `this_styles`
    const dynamicStyles = this_styles.reduce((acc, style) => {
        acc[style] = true;
        return acc;
    }, {});

    return (
        <div className={`edu3-reading-frame ${Object.keys(dynamicStyles).join(' ')}`} key={nanoid(3)}>
            <div className='edu3-reading-carpet'>
                {/* Use ReactMarkdown to render Markdown content */}
                <ReactMarkdown className='edu-reading-text'>
                    {this_content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export default GuideReading2;
