const fs = require('fs');

let content = fs.readFileSync('src/components/tiles/StepByStepTileNavigator.tsx', 'utf-8');

// 1. Make all cards h-[190px] instead of h-full so they are strictly identical.
content = content.replace(/className="h-full p-5/g, 'className="h-[190px] p-5');

// 2. Make the Toolkit grid identical to the main grid
content = content.replace(
  '<div className="grid grid-cols-1 md:max-w-md gap-5">',
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">'
);

// 3. Re-write the Toolkit card HTML to match the top cards exactly
const oldToolkitCardStart = content.indexOf('          <div\n            key={stage.id}');
const oldToolkitCardEnd = content.indexOf('          </div>\n        ))}\n      </div>');

if (oldToolkitCardStart !== -1 && oldToolkitCardEnd !== -1) {
    const newToolkitCard = `          <div
            key={stage.id}
            onClick={() => setSelectedStage(stage)}
            className={\`h-[190px] p-5 rounded-2xl bg-[#18181B] border \${stage.isLocked ? 'border-[#27272A] opacity-75 grayscale cursor-not-allowed' : 'border-[#27272A] hover:border-[#FAFAFA] cursor-pointer'} transition-all flex flex-col group\`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Toolkit</span>
              <span className={\`px-2 py-0.5 rounded text-[9px] font-bold uppercase \${stage.isLocked ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-800 text-zinc-300'}\`}>
                {stage.badge}
              </span>
            </div>
            
            <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
              {stage.title}
            </h3>
            
            <p className="text-[11px] text-zinc-400 mt-1 flex-1">
              {stage.description}
            </p>
            
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
              <span>View {stage.features.length} Tools</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
`;
    content = content.substring(0, oldToolkitCardStart) + newToolkitCard + content.substring(oldToolkitCardEnd);
}

fs.writeFileSync('src/components/tiles/StepByStepTileNavigator.tsx', content, 'utf-8');
console.log("Unified cards");
