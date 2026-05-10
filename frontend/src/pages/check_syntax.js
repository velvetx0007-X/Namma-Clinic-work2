const fs = require('fs');
const content = fs.readFileSync('d:/Namma Clinic/frontend/src/pages/PatientDashboard.jsx', 'utf8');

function checkBraces(text) {
    const stack = [];
    const pairs = { '{': '}', '(': ')', '[': ']' };
    const openers = Object.keys(pairs);
    const closers = Object.values(pairs);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (openers.includes(char)) {
            stack.push({ char, line: text.substring(0, i).split('\n').length });
        } else if (closers.includes(char)) {
            const last = stack.pop();
            if (!last || pairs[last.char] !== char) {
                console.log(`Mismatch at line ${text.substring(0, i).split('\n').length}: found ${char} but expected ${last ? pairs[last.char] : 'nothing'}`);
                if (last) console.log(`Last opened ${last.char} at line ${last.line}`);
                return false;
            }
        }
    }
    if (stack.length > 0) {
        console.log(`Unclosed: ${stack.map(s => s.char).join(', ')} at lines ${stack.map(s => s.line).join(', ')}`);
        return false;
    }
    console.log('Braces matched!');
    return true;
}

checkBraces(content);
