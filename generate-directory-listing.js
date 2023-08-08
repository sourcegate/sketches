const fs = require("fs");
const path = require("path");

// Define the root directory path (assuming the script is run from the root directory)
const rootDir = __dirname;

// List of items to exclude
const exclusions = [
  ".git",
  ".DS_Store",
  "README.md",
  "node_modules",
  "package-lock.json",
  "package.json",
  "dist",
];

// Read the contents of the root directory
const items = fs.readdirSync(rootDir);

// Generate the list items for the HTML
let listItems = items
  .filter((item) => {
    // Exclude specific files/directories and only include directories
    let stats = fs.statSync(path.join(rootDir, item));
    return stats.isDirectory() && !exclusions.includes(item);
  })
  .map((item) => {
    return `<li class="mb-2"><a href="/${item}" class="text-blue-500 hover:text-blue-700" title="${item}">${item}</a></li>`;
  })
  .join("\n");

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Sourcegate Sketches</title>
   
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    // <link href="/dist/output.css" rel="stylesheet">
    <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="/dist/output.css" rel="stylesheet">
    <script>
        function filterItems() {
            const searchValue = document.getElementById('search').value.toLowerCase();
            const items = document.querySelectorAll('#files li');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    </script>
</head>
<body class="bg-gray-100 h-screen font-sans">
    <div class="container mx-auto p-8">
        <h1 class="text-4xl mb-8">Directory Listing</h1>
        <input id="search" onkeyup="filterItems()" type="text" placeholder="Search" autocomplete="off" class="p-2 mb-4 w-full border rounded">
        <ul id="files" class="bg-white p-4 rounded shadow-lg">
            ${listItems}
        </ul>
    </div>
</body>
</html>
`;

// Write the generated HTML to index.html in the root directory
fs.writeFileSync(path.join(rootDir, "index.html"), htmlTemplate);

console.log("Directory listing page generated as index.html");
