let myBody = document.getElementsByClassName("rune-trees-container-2")[0];
let role = document.querySelector(".champion-label .champion-title").innerHTML.split(" ")[2].replace(",","");
role = role === "&amp;" ? "ARAM" : role;
role = role === "Build" ? "Nexus Blitz" : role;
JSON.stringify({
  champName: document.querySelector(".champion-label .champion-name").innerHTML,
  role: role,
  trees: Array.from(myBody.getElementsByClassName("rune-tree_header")).map(x => x.getElementsByClassName("perk-style-title")[0].innerText),
  perks: Array.from(myBody.getElementsByClassName("perk-active")).map(x => x.firstElementChild.getAttribute("alt").replace("The Rune", "").replace("The Keystone", "").trim()),
  shards: Array.from(myBody.getElementsByClassName("shard-active")).map(x => x.firstElementChild.getAttribute("alt").replace("The", "").replace("Shard", "").trim().replace(/\s/g, '')),
  spells: Array.from(document.getElementsByClassName("summoner-spells")[0].getElementsByTagName("img")).map(x => x.getAttribute("alt").replace("Summoner Spell ", ""))
});