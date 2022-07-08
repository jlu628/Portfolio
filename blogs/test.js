const matchAll = (sourceStr, searchStr) => {
    let idx = [];
    let start = 0;
    while (true) {
        let nextIdx = sourceStr.indexOf(searchStr);
        if (nextIdx == -1) {
            break;
        }
        idx.push(nextIdx + start);
        start = nextIdx + start + 1;
        sourceStr = sourceStr.substring(nextIdx + 1);
    }
    return idx;
}

title = "Anime Face Generator"
search = "gen"
console.log(matchAll(title, search));