import './../style.css';
import '@pkmn/dex';
import { Dex } from '@pkmn/dex';
import { Generations, Specie, Abilities, Moves, Types } from '@pkmn/data';

const generation = 9 //TODO: Create a selection dropdown. This should default to the current gen, and clear/repopulate the datalists when changed. 
const gens = new Generations(Dex);
let species = gens.get(generation).species;
let moves = gens.get(generation).moves;
let abilities = gens.get(generation).abilities;
let learnsets = gens.get(generation).learnsets;
let stats = gens.get(generation).stats;
let types = gens.get(generation).types;

const resultsTable = document.getElementById("resultsTable")! as HTMLTableElement;
let results: Specie[] = []

function main() {
  document.getElementById("pokemonSearchForm")!.onsubmit = search;
  appendNamesToDatalist("abilityEntryList", abilities);
  appendNamesToDatalist("moveEntryList", moves);
  appendTypesToDatalist("typeEntryList", types);
  document.getElementById("clear")!.onclick = clearSearch;
  document.getElementById("search")!.onclick = search;
  clearResults()
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
  clearResults();
}

type comparitor = "" | ">=" | "<="
async function search() {
  let form = document.getElementById("pokemonSearchForm") as HTMLFormElement;
  let resultTableBody = resultsTable.tBodies[0];

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
    SpeedComparison: getHTMLInputElementValueFromForm(form, "speedEntryComparison") as comparitor
  }

  clearResults()
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
    results.push(mon)
  }
  for (let mon of results) {
    let newRow = resultTableBody.insertRow(-1);
    createTableCell(newRow, mon.name)
    createTableCell(newRow, mon.types[0])
    createTableCell(newRow, mon.types[1])
    createTableCell(newRow, mon.abilities[0])
    createTableCell(newRow, mon.abilities[1])
    createTableCell(newRow, mon.abilities.H)
    createTableCell(newRow, mon.baseStats.hp.toString())
    createTableCell(newRow, mon.baseStats.atk.toString())
    createTableCell(newRow, mon.baseStats.def.toString())
    createTableCell(newRow, mon.baseStats.spa.toString())
    createTableCell(newRow, mon.baseStats.spd.toString())
    createTableCell(newRow, mon.baseStats.spe.toString())
    createTableCell(newRow, (mon.baseStats.hp + mon.baseStats.atk + mon.baseStats.def + mon.baseStats.spa + mon.baseStats.spd + mon.baseStats.spe).toString())
  }
}

function createTableCell(row: HTMLTableRowElement, textContent: string | undefined) {
  let newCell = row.insertCell(-1);
  if (textContent !== undefined) {
    newCell.textContent = textContent;
  }
}

async function checkLearn(parameter: string, name: string): Promise<boolean> {
  let parameterNotEmpty = parameter != ""
  let pokemonLearnsMove = await learnsets.canLearn(name, parameter)
  //if (parameters.Move4 != "" && !learnsets.canLearn(mon.name, parameters.Move4)) continue;
  return parameterNotEmpty && !pokemonLearnsMove
}

function compareStat(parameter: number, comparitor: comparitor, stat: number): boolean {
  let parameterNotNaN = !isNaN(parameter)
  let comparitorNotEmpty = comparitor != "";
  let comparitorResult = !((comparitor == ">=") ? stat >= parameter : stat <= parameter)
  return parameterNotNaN && comparitorNotEmpty && comparitorResult
}
function getHTMLInputElementValueFromForm(form: HTMLFormElement, element: string): string {
  return (form.elements[element as any] as HTMLInputElement).value;
}

/*
Search:
1. Fill out form
2. click Search
3. acquire list of pokemon
4. filter list of pokemon by form values
5. store list of filtered
6. Sort list by name
7. Enter row for each in list
8. Clear rows if list sorted, sort, insert sorted rows
*/

// function compareResults(results: Specie[], key: string): Specie[] {
// }
// function compareStrings(n1: BasicEffect, n2: BasicEffect) {
//   if (n1.name > n2.name) {
//     return 1;
//   }
//   if (n1.name < n2.name) {
//     return -1;
//   }
//   return 0;
// }
// return []

function clearResults() {
  results = []
  let header = (resultsTable.tHead) ? resultsTable.tHead : resultsTable.createTHead();
  let headerRow = (header.rows.length) ? header.rows[0] : header.insertRow();
  while (headerRow.cells.length) headerRow.deleteCell(-1);
  for (let headerLabel of ["Name", "Type 1", "Type 2", "Ability 1", "Ability 2", "H. Ability", "HP", "Atk", "Def", "SpA", "SpD", "Spe", "Total"]) {
    let newHeader = document.createElement('th');
    newHeader.textContent = headerLabel;
    headerRow.appendChild(newHeader);
  }
  let body = (resultsTable.tBodies.length) ? resultsTable.tBodies[0] : resultsTable.createTBody();
  while (body.rows.length) body.deleteRow(-1);

  // Name, Type 1, Type 2 ,Ability 1, Ability 2, H. Ability, HP, Atk, Def, SpA, SpD, Spe, Total
  // TODO: Hover over a value in this table to see Min/Max for detrimental, neutral, and beneficial natures.
}

window.onload = main;