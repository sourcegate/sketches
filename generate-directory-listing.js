const fs = require("fs");
const path = require("path");

const rootDir = __dirname;

const exclusions = [
  ".git",
  ".DS_Store",
  "README.md",
  "node_modules",
  "package-lock.json",
  "package.json",
  "dist",
  ".vercel",
];

const items = fs.readdirSync(rootDir);

let listItems = items
  .map((item) => {
    let itemPath = path.join(rootDir, item);
    let stats = fs.statSync(itemPath);
    return {
      name: item,
      isDirectory: stats.isDirectory(),
      modifiedTime: stats.mtime.getTime(),
    };
  })
  .filter((item) => item.isDirectory && !exclusions.includes(item.name))
  .sort((a, b) => b.modifiedTime - a.modifiedTime) // Sort in descending order
  .map((item) => {
    return `<li class="mb-2"><a href="/${item.name}" class="text-blue-500 hover:text-blue-700" title="${item.name}">${item.name}</a></li>`;
  })
  .join("\n");

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Sourcegate Sketches</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/dist/output.css" rel="stylesheet">
    <meta charset="UTF-8">
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
        <h1 class="text-4xl mb-8">Sourcegate Sketches</h1>
        <input id="search" onkeyup="filterItems()" type="text" placeholder="Search" autocomplete="off" class="p-2 mb-4 w-full border rounded">
        <ul id="files" class="bg-white p-4 rounded shadow-lg">
            ${listItems}
        </ul>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, "index.html"), htmlTemplate);

console.log("Directory listing page generated as index.html");
