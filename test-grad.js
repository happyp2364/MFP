const regex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/;
const str = "linear-gradient(to right, rgb(23, 23, 23), rgb(38, 38, 38))";
const match = str.match(regex);
console.log(match ? match[0] : "no match");
