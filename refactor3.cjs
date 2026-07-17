const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Fix the fallback in activeChat
content = content.replace(
  /const activeChat = conversations\.find\(c => c\.id === activeChatId\) \|\| conversations\[0\];/g,
  'const activeChat = activeChatId ? conversations.find(c => c.id === activeChatId) : null;'
);

// 2. Replace the main chat canvas area
const mainChatRegex = /<main className="flex-1 pt-16 px-4 max-w-2xl mx-auto w-full flex flex-col gap-3 overflow-y-auto pb-32">[\s\S]*?{activeChat\?\.messages\.map\(\(msg\) => \([\s\S]*?<\/div>[\s\S]*?<\/main>/;

const newMainChat = `<main className="flex-1 pt-16 px-4 max-w-[900px] mx-auto w-full flex flex-col gap-5 overflow-y-auto pb-40">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in my-auto">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-cyan-accent" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to PAB AI</h2>
                <p className="text-neutral-500 mb-8 max-w-md">How can I help you today?</p>
                
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                  {['Expand Outline', 'Create Presentation', 'Explain Code', 'Circuit Analysis', 'Summarize PDF'].map((prompt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(prompt)}
                      className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold text-[10px] uppercase tracking-widest shadow-sm">
                    Today
                  </span>
                </div>
                
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={\`flex flex-col gap-1 max-w-[85%] \${
                      msg.sender === "user" ? "self-end items-end animate-fade-in" : "self-start items-start"
                    }\`}
                  >
                    <div
                      className={\`p-4 rounded-2xl shadow-sm \${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-bl-none"
                      }\`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      
                      {msg.imageUrl && (
                        <div className="rounded-xl overflow-hidden my-3 border border-neutral-100 dark:border-neutral-800">
                          <img src={msg.imageUrl} alt="Visual context" className="w-full h-40 object-cover" />
                        </div>
                      )}
                      
                      {msg.bullets && msg.bullets.length > 0 && (
                        <ul className="space-y-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 opacity-90">
                          {msg.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className={\`flex items-center gap-3 px-2 mt-1 text-neutral-400 \${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }\`}>
                      <span className="text-[10px] font-medium">{msg.time}</span>
                      {msg.sender === "ai" && (
                        <div className="flex items-center gap-2">
                          <button className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                          <button className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><HelpCircle className="w-3.5 h-3.5" /></button>
                          <button className="hover:text-green-500 transition-colors"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button className="hover:text-red-500 transition-colors"><Info className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {isGenerating && (
              <div className="self-start items-start flex flex-col gap-1 max-w-[85%]">
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} className="h-4 w-full" />
          </main>`;

content = content.replace(mainChatRegex, newMainChat);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Refactor script 3 completed');
