import './style.css';
import '@pkmn/dex';
import { Dex, Ability, Move, BasicEffect } from '@pkmn/dex';
import { Generations } from '@pkmn/data';

const gens = new Generations(Dex);
console.log(gens.get(5).species("Bulbasaur"))
function main() {
  let abilities: Ability[] = Dex.abilities.all().slice().sort(compareStrings);
  let moves: Move[] = Dex.moves.all().slice().sort(compareStrings);
  appendNamesToDatalist('abilityEntryList', abilities);
  appendNamesToDatalist('moveEntryList', moves);
  document.getElementById('reset')!.onclick = resetSearch;
  document.getElementById('search')!.onclick = search;
}

function appendNamesToDatalist(elementName: string, list: BasicEffect[]) {
  let dataListNode = document.getElementById(elementName)!;
  for (let item of list) {
    if (!item.isNonstandard) {
      let option = document.createElement('option');
      option.value = item.name;
      dataListNode.appendChild(option);
    }
  }
}

function resetSearch() {
  let form = document.getElementById('pokemonSearchForm') as HTMLFormElement;
  console.log(form);
  form.reset();
}

function getInputElementById(id: string) {
  return document.getElementById(id) as HTMLInputElement;
}

function search() {
  let parameters = {
    Ability: getInputElementById('abilityEntry').value,
    Move1: getInputElementById('move1Entry').value,
    Move2: getInputElementById('move2Entry').value,
    Move3: getInputElementById('move3Entry').value,
    Move4: getInputElementById('move4Entry').value,
    HP: getInputElementById('hpEntry').value,
    HPComparison: getInputElementById('hpEntryComparison').value,
    Attack: getInputElementById('attackEntry').value,
    AttackComparison: getInputElementById('attackEntryComparison').value,
    Defense: getInputElementById('defenseEntry').value,
    DefenseComparison: getInputElementById('defenseEntryComparison').value,
    SpecialAttack: getInputElementById('specialAttackEntry').value,
    SpecialAttackComparison: getInputElementById('specialAttackEntryComparison')
      .value,
    SpecialDefense: getInputElementById('specialDefenseEntry').value,
    SpecialDefenseComparison: getInputElementById(
      'specialDefenseEntryComparison'
    ).value,
    Speed: getInputElementById('speedEntry').value,
    SpeedComparison: getInputElementById('speedEntryComparison').value,
  };

  let form = document.getElementById('pokemonSearchForm') as HTMLFormElement;
  console.log(form);
  console.log(parameters);
}

function compareStrings(n1: BasicEffect, n2: BasicEffect) {
  if (n1.name > n2.name) {
    return 1;
  }
  if (n1.name < n2.name) {
    return -1;
  }
  return 0;
}

// TODO: Create function that inserts data list elements. Use the shape of the array to assist.
window.onload = main;
