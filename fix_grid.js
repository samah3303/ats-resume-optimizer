const fs = require('fs');
let content = fs.readFileSync('src/components/tiles/StepByStepTileNavigator.tsx', 'utf-8');

// The single container for all cards:
const newGridStart = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">`;

content = content.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">',
  newGridStart
);

content = content.replace(
  '          </div>\n          \n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">',
  ''
);

fs.writeFileSync('src/components/tiles/StepByStepTileNavigator.tsx', content, 'utf-8');
console.log('Grid consolidated');
