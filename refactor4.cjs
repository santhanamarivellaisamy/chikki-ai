const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add state for profile menu and modal
const stateRegex = /const \[notificationsEnabled, setNotificationsEnabled\] = useState\(true\);/;
content = content.replace(stateRegex, \`const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);\`);

// 2. Add the Profile Modal component to the bottom of the file (before the export or inside)
// Actually, putting it outside App is better.
const profileModalCode = \`
function ProfileModal({ user, onClose }: { user: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-semibold">Profile Settings</h3>
          <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} size={16} />
            <div>
              <button className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700">Upload Photo</button>
              <button className="px-3 py-1.5 text-red-500 text-sm font-medium ml-2 hover:underline">Remove</button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Full Name</label>
            <input type="text" defaultValue={user.name} className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-1 focus:ring-cyan-accent" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email (Read Only)</label>
            <input type="email" defaultValue={user.email} disabled className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Change Password</label>
            <input type="password" placeholder="New password" className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-1 focus:ring-cyan-accent" />
          </div>
        </div>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-cyan-accent text-white text-sm font-medium rounded-lg hover:bg-cyan-accent/90">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
\`;

content = content.replace('function getFormattedTime()', profileModalCode + '\\nfunction getFormattedTime()');

// 3. Add profile menu logic in header
const headerAvatarRegex = /<div[\\s\\S]*?onClick=\{\(\) => setScreen\("settings"\)\}[\\s\\S]*?className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 active:scale-95 transition-transform cursor-pointer flex-shrink-0"[\\s\\S]*?>[\\s\\S]*?\{user && <UserAvatar name=\{user\.name\} size=\{8\} \/>\}[\\s\\S]*?<\/div>/;

const newHeaderAvatar = \`<div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 active:scale-95 transition-transform cursor-pointer flex-shrink-0"
              >
                {user && <UserAvatar name={user.name} size={8} />}
              </div>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-fade-in">
                    <button onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium">Profile</button>
                    <button onClick={() => { setShowProfileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Account</button>
                    <button onClick={() => { setShowProfileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Appearance</button>
                    <button onClick={() => { setShowProfileMenu(false); setScreen("settings"); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Settings</button>
                    <button onClick={() => { setShowProfileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Help</button>
                    <div className="border-t border-neutral-100 dark:border-neutral-800 my-1"></div>
                    <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium">Sign Out</button>
                  </div>
                </>
              )}
            </div>\`;

content = content.replace(headerAvatarRegex, newHeaderAvatar);

// 4. Inject ProfileModal rendering
const rootRenderRegex = /(<div id="pab-app-root" className=\{`min-h-screen transition-colors duration-300 \$\{darkMode \? "dark bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"\}`\}>)/;
content = content.replace(rootRenderRegex, \`$1
      {showProfileModal && user && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />}
\`);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Refactor script 4 completed');
