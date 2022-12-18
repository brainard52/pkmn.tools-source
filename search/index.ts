import '/search/index.css';
import '@pkmn/dex';
import { Dex } from '@pkmn/dex';
import { Generations, Specie, Abilities, Moves, Types } from '@pkmn/data';
import { StatID } from '@pkmn/types';

const generation = 9 //TODO: Create a selection dropdown. This should default to the current gen, and clear/repopulate the datalists when changed.
const gens = new Generations(Dex)
let species = gens.get(generation).species
let moves = gens.get(generation).moves
let abilities = gens.get(generation).abilities
let learnsets = gens.get(generation).learnsets
let stats = gens.get(generation).stats
let types = gens.get(generation).types

const resultsDiv = document.getElementById("resultsDiv")! as HTMLDivElement
let results: Specie[] = []

function main() {
  updateMargin();
  window.onresize = updateMargin;
  document.getElementById("pokemonSearchForm")!.onsubmit = search;
  appendNamesToDatalist("abilityEntryList", abilities);
  appendNamesToDatalist("moveEntryList", moves);
  appendTypesToDatalist("typeEntryList", types);
  document.getElementById("clear")!.onclick = clearSearch;
  document.getElementById("search")!.onclick = search;
  clearResults();
}

function appendTypesToDatalist(elementName: string, list: Types){
  let dataListNode = document.getElementById(elementName)!;
  for (let type of list) {
    let option = document.createElement("option");
    option.value = type.name;
    dataListNode.appendChild(option);
  }
}

function appendNamesToDatalist(elementName: string, list: Abilities | Moves) {
  let dataListNode = document.getElementById(elementName)!;
  for (let item of list) {
    if (!item.isNonstandard) {
      let option = document.createElement("option");
      option.value = item.name;
      dataListNode.appendChild(option);
    }
  }
}

function clearSearch() {
  let form = document.getElementById("pokemonSearchForm")! as HTMLFormElement;
  form.reset();
  results = [];
  clearResults();
  clearResultsDiv();
}

function clearResultsDiv() {
  while (resultsDiv.hasChildNodes()) {
    resultsDiv.removeChild(resultsDiv.firstChild!);
  }
}

function clearResults() {
  results = [];
}

type comparitor = "" | ">=" | "<=";
async function search() {
  // TODO: Write a function that json-izes the results and puts it into a field above the search results.
  let form = document.getElementById("pokemonSearchForm") as HTMLFormElement;
  clearResults();

  let parameters = {
    Ability: getHTMLInputElementValueFromForm(form, "abilityEntry"),
    Type1: getHTMLInputElementValueFromForm(form, "type1Entry"),
    Type2: getHTMLInputElementValueFromForm(form, "type2Entry"),
    Move1: getHTMLInputElementValueFromForm(form, "move1Entry"),
    Move2: getHTMLInputElementValueFromForm(form, "move2Entry"),
    Move3: getHTMLInputElementValueFromForm(form, "move3Entry"),
    Move4: getHTMLInputElementValueFromForm(form, "move4Entry"),
    HP: parseInt(getHTMLInputElementValueFromForm(form, "hpEntry"), 10),
    HPComparison: getHTMLInputElementValueFromForm(form, "hpEntryComparison") as comparitor,
    Attack: parseInt(getHTMLInputElementValueFromForm(form, "attackEntry"), 10),
    AttackComparison: getHTMLInputElementValueFromForm(form, "attackEntryComparison") as comparitor,
    Defense: parseInt(getHTMLInputElementValueFromForm(form, "defenseEntry"), 10),
    DefenseComparison: getHTMLInputElementValueFromForm(form, "defenseEntryComparison") as comparitor,
    SpecialAttack: parseInt(getHTMLInputElementValueFromForm(form, "specialAttackEntry"), 10),
    SpecialAttackComparison: getHTMLInputElementValueFromForm(form, "specialAttackEntryComparison") as comparitor,
    SpecialDefense: parseInt(getHTMLInputElementValueFromForm(form, "specialDefenseEntry"), 10),
    SpecialDefenseComparison: getHTMLInputElementValueFromForm(form, "specialDefenseEntryComparison") as comparitor,
    Speed: parseInt(getHTMLInputElementValueFromForm(form, "speedEntry"), 10),
    SpeedComparison: getHTMLInputElementValueFromForm(form, "speedEntryComparison") as comparitor,
    SortDirection: getHTMLInputElementValueFromForm(form, "sortDirection"),
    Sort: getHTMLInputElementValueFromForm(form, "sortSelection") as StatID
  }

  for (let mon of species) {
    if (parameters.Ability != "" && !([mon.abilities[0], mon.abilities[1], mon.abilities.H] as string[]).includes(parameters.Ability)) continue;
    if (parameters.Type1 != "" && !([mon.types[0], mon.types[1]] as string[]).includes(parameters.Type1)) continue;
    if (parameters.Type2 != "" && !([mon.types[0], mon.types[1]] as string[]).includes(parameters.Type2)) continue;
    if (await checkLearn(parameters.Move1, mon.name)) continue;
    if (await checkLearn(parameters.Move2, mon.name)) continue;
    if (await checkLearn(parameters.Move3, mon.name)) continue;
    if (await checkLearn(parameters.Move4, mon.name)) continue;
    if (compareStat(parameters.HP, parameters.HPComparison, mon.baseStats.hp)) continue;
    if (compareStat(parameters.Attack, parameters.AttackComparison, mon.baseStats.atk)) continue;
    if (compareStat(parameters.Defense, parameters.DefenseComparison, mon.baseStats.def)) continue;
    if (compareStat(parameters.SpecialAttack, parameters.SpecialAttackComparison, mon.baseStats.spa)) continue;
    if (compareStat(parameters.SpecialDefense, parameters.SpecialDefenseComparison, mon.baseStats.spd)) continue;
    if (compareStat(parameters.Speed, parameters.SpeedComparison, mon.baseStats.spe)) continue;
    results.push(mon);
  }
  sortResults(parameters.Sort, parameters.SortDirection)
  displayResults();
}

function sortResults(sortBy: StatID, sortDirection: string) {
  console.log(`${sortDirection} sort by ${sortBy}`)
  results.sort(comparePokemon(sortBy, sortDirection))
}
function comparePokemon(sortBy: StatID, sortDirection: string) {
  if (sortDirection == "descending") {
    var sortMod = -1
  }
  if (sortDirection == "ascending") {
    var sortMod = 1
  }
  return function(a: Specie, b: Specie) {
    if (a.baseStats[sortBy] > b.baseStats[sortBy]) {
      return 1*sortMod;
    }
    if (a.baseStats[sortBy] < b.baseStats[sortBy]) {
      return -1*sortMod;
    }
    return 0;
  }
}

function displayResults() {
  clearResultsDiv();
  for (let mon of results) {
    resultsDiv.appendChild(createStatCard(mon));
  }
}

async function checkLearn(parameter: string, name: string): Promise<boolean> {
  let parameterNotEmpty = parameter != "";
  let pokemonLearnsMove = await learnsets.canLearn(name, parameter);
  //if (parameters.Move4 != "" && !learnsets.canLearn(mon.name, parameters.Move4)) continue;
  return parameterNotEmpty && !pokemonLearnsMove;
}

function compareStat(parameter: number, comparitor: comparitor, stat: number): boolean {
  let parameterNotNaN = !isNaN(parameter);
  let comparitorNotEmpty = comparitor != "";
  let comparitorResult = !((comparitor == ">=") ? stat >= parameter : stat <= parameter);
  return parameterNotNaN && comparitorNotEmpty && comparitorResult;
}

function getHTMLInputElementValueFromForm(form: HTMLFormElement, element: string): string {
  return (form.elements[element as any] as HTMLInputElement).value;
}

// TODO: Hover over a value in this table to see Min/Max for detrimental, neutral, and beneficial natures.
// TODO: Click a stat to switch it from base stat to min/max for detrimental, neutral, and beneficial natures. Color similarly to the games. Only show one stat at a time, and allow the player to cycle through.

function updateMargin(){
  document.documentElement.style.setProperty("--aspect-ratio", (document.documentElement.clientWidth/document.documentElement.clientHeight).toString())
  /* TODO: Figure out why --aspect-ratio isn't working. It's likely due to the CSS
  * for #contentBoundingBox being incorrectly implemented. For now, I'm leaving
  * the Javascript implementation I had before my attempt to move it to CSS. 
  */
  let ratio = document.documentElement.clientWidth/document.documentElement.clientHeight;
  let box = document.getElementById("contentBoundingBox") as HTMLParagraphElement;
  let margin = "0%";
  if (ratio >= 1.4) {
      margin =  `${100*(Math.sqrt(ratio-1.4)/10)}\%`;
  }
  box.style.marginLeft = margin;
  box.style.marginRight = margin;
}

function createStatCard(mon: Specie): HTMLDivElement{
  let container = createDiv("cardContainer");
  container.appendChild(createDiv("cardName", mon.name));
  let cardTypeContainer = createDiv("cardTypeContainer", `${mon.types[0]}` + ((mon.types[1]) ? ` ${mon.types[1]}` : "") );
  container.appendChild(cardTypeContainer);
  /*let cardImageContainer = createDiv("cardImageContainer");
  container.appendChild(cardImageContainer);
  container.appendChild(createDiv("cardAbilitiesLabel", "Abilities"))
  */
  container.appendChild(createDiv("cardAbility1", mon.abilities[0]))
  container.appendChild(createDiv("cardAbility2", ((mon.abilities[1]) ? "\n" + mon.abilities[1] : "")))
  container.appendChild(createDiv("cardAbilityH", ((mon.abilities.H) ? "\n" + mon.abilities.H + " (H)": "")))
  container.appendChild(createBaseStatDiv("cardHP", `HP ${mon.baseStats.hp.toString()}`))
  container.appendChild(createBaseStatDiv("cardAtk", `Atk ${mon.baseStats.atk.toString()}`))
  container.appendChild(createBaseStatDiv("cardDef", `Def ${mon.baseStats.def.toString()}`))
  container.appendChild(createBaseStatDiv("cardSpa", `SpA ${mon.baseStats.spa.toString()}`))
  container.appendChild(createBaseStatDiv("cardSpd", `SpD ${mon.baseStats.spd.toString()}`))
  container.appendChild(createBaseStatDiv("cardSpe", `Spe ${mon.baseStats.spe.toString()}`))
  container.appendChild(createDiv("cardStatTotal", `Total ${(mon.baseStats.hp + mon.baseStats.atk + mon.baseStats.def + mon.baseStats.spa + mon.baseStats.spd + mon.baseStats.spe).toString()}`))
  return container;
}

function createDiv(elementClass: string, text?: string): HTMLDivElement{
  let div = document.createElement("div");
  if (text) {
    div.textContent = text;
  }
  div.classList.add(elementClass);
  return div;
}

function createBaseStatDiv(elementClass: string, text?: string): HTMLDivElement{
  let div = createDiv(elementClass)
  if (text) {
    div.textContent = text;
  }
  div.classList.add("baseStat")
  return div;
}

window.onload = main;