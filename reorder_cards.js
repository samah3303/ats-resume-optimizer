const fs = require('fs');

let content = fs.readFileSync('src/components/tiles/StepByStepTileNavigator.tsx', 'utf-8');

// Function to extract a card block
function extractCard(content, cardName) {
    const startStr = `            {/* ${cardName}`;
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) return null;
    
    // Find the next card or the end of the grid
    let endIdx = content.indexOf('            {/* Card', startIdx + 10);
    if (endIdx === -1) {
        endIdx = content.indexOf('          </div>\n        </div>', startIdx);
    }
    
    return content.substring(startIdx, endIdx);
}

const c1 = extractCard(content, 'Card 1: General ATS');
const c2 = extractCard(content, 'Card 2: LinkedIn Updates');
const c3 = extractCard(content, 'Card 3: 2-Month Roadmap');
const c4 = extractCard(content, 'Card 4: JD ATS Analysis');
const c5 = extractCard(content, 'Card 5: Kanban Tracker');
const c6 = extractCard(content, 'Card 6: Mock Interviews');
const c7 = extractCard(content, 'Card 7: Salary War Room');

if (!c1 || !c2 || !c3 || !c4 || !c5 || !c6 || !c7) {
    console.log("Could not find all cards");
    process.exit(1);
}

// Modify the conditions and texts
let newC3 = c5.replace('Step 5', 'Step 3')
              .replace('Step 5', 'Step 3') // replace in locked view too
              .replace('progress.latestAnalysisId', '(progress.generalAtsScore && progress.generalAtsScore >= 80) || (progress.latestAnalysisScore && progress.latestAnalysisScore >= 80)')
              .replace('Run 1 JD Analysis to unlock.', 'Hit 80+ General ATS Score to unlock.');

let newC4 = c4.replace('progress.hasRoadmap', '(progress.generalAtsScore && progress.generalAtsScore >= 80) || (progress.latestAnalysisScore && progress.latestAnalysisScore >= 80)')
              .replace('Generate your 8-Week roadmap to unlock.', 'Hit 80+ General ATS Score to unlock.');

let newC5 = c3.replace('Step 3', 'Step 5')
              .replace('Step 3', 'Step 5');
// The lock for Roadmap is already hasLinkedin

// Reconstruct the grid
const startGrid = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">');
const endGrid = content.indexOf('          </div>\n        </div>\n      )}');

if (startGrid !== -1 && endGrid !== -1) {
    const beforeGrid = content.substring(0, startGrid);
    const afterGrid = content.substring(endGrid);
    
    const newGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">\n`
                    + c1 + c2 + newC3 + newC4 + newC5 + c6 + c7;
                    
    content = beforeGrid + newGrid + afterGrid;
    fs.writeFileSync('src/components/tiles/StepByStepTileNavigator.tsx', content, 'utf-8');
    console.log("Reordered cards");
} else {
    console.log("Could not find grid bounds");
}
