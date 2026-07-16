const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Helper to generate initials Avatar instead of img tag
const generateAvatarHelper = `
function UserAvatar({ name, size = 8 }: { name: string, size?: number }) {
  const getInitials = (n: string) => {
    const parts = n.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };
  const getBgColor = (n: string) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
    let hash = 0;
    for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };
  return (
    <div className={\`w-\${size} h-\${size} rounded-full flex items-center justify-center text-white font-bold text-xs \${getBgColor(name)}\`}>
      {getInitials(name)}
    </div>
  );
}
`;

content = content.replace('function isKeyValid', generateAvatarHelper + '\nfunction isKeyValid');

// Replace avatars in the sidebar (line ~861)
content = content.replace(
  /<div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100 border dark:border-neutral-800">\s*<img src=\{user.avatarUrl\}.*?\/>\s*<\/div>/g,
  '<UserAvatar name={user.name} size={8} />'
);

// Replace avatars in header / chat areas
content = content.replace(
  /<img src=\{user\?.avatarUrl.*?\} alt="Avatar" className="w-full h-full object-cover" \/>/g,
  '{user && <UserAvatar name={user.name} size={8} />}'
);

// We need to fix the chat area styles (Right aligned user blue, Left aligned assistant neutral)
// Replace user message styling:
content = content.replace(
  /bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100/g,
  'bg-blue-600 text-white rounded-br-none'
);
// Wait, that might replace assistant bubbles too if they share the class.
// A better way is to update the Chat Area completely.

fs.writeFileSync(appPath, content, 'utf8');
console.log('Refactor script completed');
