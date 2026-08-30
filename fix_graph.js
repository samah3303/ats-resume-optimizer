const fs = require('fs');
const content = fs.readFileSync('src/components/tiles/StepByStepTileNavigator.tsx', 'utf-8');

// 1. Add Knowledge Graph to the Toolkit Features
const newFeature = `        {
          id: "knowledge-graph",
          title: "Career Knowledge Graph",
          tagline: "Visualize connections",
          description: "Visualize connections between your skills, resumes, and target jobs.",
          href: "/dashboard/graph",
          icon: "🕸️",
          badge: "New",
        },
`;
let newContent = content.replace('      features: [', '      features: [\n' + newFeature);

// 2. Remove Card 8 from the top grid
// We need to find `            {/* Card 8: Career Knowledge Graph */}`
// and remove everything up to `          </div>\n        </div>\n      )}\n\n      {/* Campaign Pipeline Grid */}`
const startCard8 = newContent.indexOf('            {/* Card 8: Career Knowledge Graph */}');
if (startCard8 !== -1) {
    const endCard8 = newContent.indexOf('          </div>\n        </div>', startCard8);
    if (endCard8 !== -1) {
        newContent = newContent.substring(0, startCard8) + newContent.substring(endCard8);
    }
} else {
    console.log("Could not find card 8");
}

// 3. Make boxes the same size: add 'h-full' to the Link and div elements representing the cards.
// Search for `className="p-5 rounded-2xl` and change to `className="h-full p-5 flex flex-col rounded-2xl`
newContent = newContent.replaceAll('className="p-5 rounded-2xl', 'className="h-full p-5 rounded-2xl');

fs.writeFileSync('src/components/tiles/StepByStepTileNavigator.tsx', newContent, 'utf-8');
console.log("Success");
