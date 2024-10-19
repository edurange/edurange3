
import React  from 'react';




function HomeChapter (  ) {


    return (
	    <div>
	    <h2> Welcome to EDURange!</h2>
	    <p> If this is your first time using EDURange or the Linux command line, the information on this tab may help you get familiar with how to read our guides.</p>
	    <br></br>
	    <p> Otherwise, if you have used edurange before or just want to get started, you can skip ahead to Tab #1 on the bar above. </p>
	    <br></br>
	    <p> The pane on the left has some helpful links we always include, but you can resize these panes using the slider at the top if you just want to have this guide fullscreen (reommended)</p>
	    <br></br>
	    <h3 id="how-to-read-and-write-commands">How to Read and Write Commands</h3>
	    <p>When reading examples and help documents about the command line, some conventions will be used.</p>
	    <p>A command - as it should be typed on the command line - always begins with its name. A command “<code>example</code>” would be written:</p>
	    <pre><code className="lang-sh"><span className="hljs-attribute">example</span>
	    </code></pre>
	    <p>If that command takes “<em>arguments</em>” after it, those arguments are separated by spaces.</p>
	    <pre><code className="lang-sh"><span className="hljs-attribute">example argument</span>
	    </code></pre>
	    <p>Means the literal text “<code>example</code>”, followed by a space, followed by an argument. Here I’ve called that argument “<em>argument</em>” just to introduce the idea, but in practice people will try to use descriptive names to indicate the use or meaning of the argument.</p>
	    <p>You would not write “<code>example argument</code>” based on this description. Instead, “<code>argument</code>” is a name for text you should replace. Why? Because generally commands follow this pattern:</p>
	    <pre><code className="lang-sh"><span className="hljs-tag">&lt;<span className="hljs-name">command</span> <span className="hljs-attr">name</span>&gt;</span> <span className="hljs-tag">&lt;<span className="hljs-name">argument</span> <span className="hljs-attr">1</span>&gt;</span> <span className="hljs-tag">&lt;<span className="hljs-name">argument</span> <span className="hljs-attr">2</span>&gt;</span> ... <span className="hljs-tag">&lt;<span className="hljs-name">argument</span> <span className="hljs-attr">N</span>&gt;</span>
	    </code></pre>
	    <p>The command receives the arguments as a list according to the order you specified them. So when you’re talking about the command line input “<code>example argument</code>” you know “<code>argument</code>” is shorthand for whatever came after the command name.</p>
	    <p>“<code>ls</code>” is a command that’s used for viewing files in a directory. By itself, it looks at the directory you are currently working in. But it can be given <em>arguments</em> to change where it looks and how it displays what it finds.</p>
	    <p>You might see the use of <code>ls</code> described like this:</p>
	    <pre><code className="lang-sh"><span className="hljs-keyword">ls</span> [<span className="hljs-keyword">argument</span> ...]
	    </code></pre>
	    <p>In the above statement, “<code>ls</code>” is the literal text you’d enter, followed by a space.</p>
	    <p>What about the square brackets “<code>[]</code>”, then? Square brackets indicate an argument that is not required but can be provided for alternative or extra behavior.</p>
	    <p>The “<code>...</code>” indicates that you can give as many arguments as you like. Inside the square brackets “<code>[]</code>” their meanings combine: “<code>[argument ...]</code>” means “<em>zero or more arguments</em>”.</p>
	    <p>In this case, you can give <code>ls</code> <em>paths</em> - the locations of directories or files. If the path is a directory, <code>ls</code> will list the files inside it. If you provide more than one path, <code>ls</code> will list each in turn. Some paths you might try are “<code>.</code>”, “<code>/</code>”, “<code>~</code>”, “<code>/bin</code>” and “<code>/home</code>”</p>
	    <h3 id="how-to-read-this-guide">How to Read This Guide</h3>
	    <p><em>Italics</em> indicate key terms and are used for emphasis.</p>
	    <p><strong>Bold</strong> is used to identify acronyms, initialisms, etc.</p>
	    <p><code>Code quotes</code> represent a command, literal characters or text strings, or other things as they appear or are used on the computer.</p>
	    <pre><code className="lang-sh">Code <span className="hljs-literal">quote</span> blocks like this indicate <span className="hljs-keyword">a</span> prompt you should type <span className="hljs-keyword">in</span>, <span className="hljs-keyword">or</span> something you should expect <span className="hljs-built_in">to</span> see <span className="hljs-keyword">on</span> <span className="hljs-title">the</span> <span className="hljs-title">command</span> <span className="hljs-title">line</span>.
	    </code></pre>
	    <p>When new definitions are introduced, “quotes <em>with italics</em>” will be used.</p>
	    <p>Usually we’ll be discussing text as it appears on the command line. As such, the above conventions describing commands and their arguments will generally be observed.</p>
	    <p>Angle brackets might be used where whitespace is not available: “<code>/home/&lt;username&gt;</code>” means the string “<code>/home/</code>” followed immediately by a user name, with no space in between.</p>
	    <p>In some places where there might be ambiguities or command line syntax otherwise doesn’t apply, angle brackets “<code>&lt;&gt;</code>” may also be used to indicate metatextual substitution. An example of such as used previously:</p>
	    <pre><code className="lang-sh"><span className="hljs-tag">&lt;<span className="hljs-name">command</span> <span className="hljs-attr">name</span>&gt;</span> <span className="hljs-tag">&lt;<span className="hljs-name">argument</span> <span className="hljs-attr">1</span>&gt;</span> <span className="hljs-tag">&lt;<span className="hljs-name">argument</span> <span className="hljs-attr">2</span>&gt;</span> ... <span className="hljs-tag">&lt;<span className="hljs-name">argument</span> <span className="hljs-attr">N</span>&gt;</span>
	    </code></pre>
	    <ul>
	    <li>“<code>&lt;command name&gt;</code>” indicates a location where the text of a command would be</li>
	    <li>“<code>&lt;argument 1</code>”, “<code>&lt;argument 2&gt;</code>” indicate the position of arguments</li>
	    <li>“<code>...</code>” indicates logical/mathematical repetition</li>
	    </ul>
	    </div>
            
    );
};

export default HomeChapter;
