const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Replace the message input area
// We find the form and replace its contents.
const inputFormRegex = /<form\s+onSubmit=\{[\s\S]*?className="p-4 border-t[\s\S]*?<\/form>/;
const newInputForm = `<form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 w-full shrink-0 relative z-20">
            <div className="max-w-[900px] mx-auto relative flex items-end gap-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-sm focus-within:ring-2 focus-within:ring-cyan-accent/20 focus-within:border-cyan-accent/30 transition-all">
              
              <button type="button" className="p-3 text-neutral-400 hover:text-cyan-accent transition-colors rounded-full shrink-0 self-end mb-0.5">
                <Plus className="w-5 h-5" />
              </button>

              <textarea
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask PAB AI anything..."
                className="w-full max-h-[150px] bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none py-3 px-2 text-[15px] leading-relaxed self-center"
                rows={1}
                disabled={isGenerating}
              />
              
              <div className="flex items-center gap-1 self-end mb-1 shrink-0 pr-1">
                <button type="button" className="p-2.5 text-neutral-400 hover:text-cyan-accent transition-colors rounded-full cursor-pointer">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isGenerating}
                  className="p-2.5 rounded-full bg-cyan-accent hover:bg-cyan-accent/90 disabled:opacity-50 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white transition-all transform active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
            
            <div className="max-w-[900px] mx-auto mt-2 flex justify-center items-center">
              <p className="text-[10px] text-neutral-400 font-medium">PAB AI can make mistakes. Verify important information.</p>
            </div>
          </form>`;

content = content.replace(inputFormRegex, newInputForm);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Refactor script 2 completed');
