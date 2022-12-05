import './style.css';
import '@pkmn/dex';
import {Dex} from '@pkmn/dex';
import {Generations, Abilities, Moves} from '@pkmn/data';

const generation = 9 //TODO: Create a selection dropdown. This should default to the current gen, and clear/repopulate the datalists when changed. 
const gens = new Generations(Dex);

function main(){
  document.getElementById("pokemonSearchForm")!.onsubmit = search
  appendNamesToDatalist("abilityEntryList", gens.get(generation).abilities);
  appendNamesToDatalist("moveEntryList", gens.get(generation).moves);
  document.getElementById("clear")!.onclick = clearSearch;
  document.getElementById("search")!.onclick = search;
}

function appendNamesToDatalist(elementName: string, list: Abilities | Moves){
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
}

function search() {
  let form = document.getElementById("pokemonSearchForm") as HTMLFormElement;
  let parameters = {
    Ability: getHTMLInputElementValueFromForm(form, "abilityEntry"),
    Move1: getHTMLInputElementValueFromForm(form, "move2Entry"),
    Move2: getHTMLInputElementValueFromForm(form, "move2Entry"),
    Move3: getHTMLInputElementValueFromForm(form, "move3Entry"),
    Move4: getHTMLInputElementValueFromForm(form, "move4Entry"),
    HP: getHTMLInputElementValueFromForm(form, "hpEntry"),
    HPComparison: getHTMLInputElementValueFromForm(form, "hpEntryComparison"),
    Attack: getHTMLInputElementValueFromForm(form, "attackEntry"),
    AttackComparison: getHTMLInputElementValueFromForm(form, "attackEntryComparison"),
    Defense: getHTMLInputElementValueFromForm(form, "defenseEntry"),
    DefenseComparison: getHTMLInputElementValueFromForm(form, "defenseEntryComparison"),
    SpecialAttack: getHTMLInputElementValueFromForm(form, "specialAttackEntry"),
    SpecialAttackComparison: getHTMLInputElementValueFromForm(form, "specialAttackEntryComparison"),
    SpecialDefense: getHTMLInputElementValueFromForm(form, "specialDefenseEntry"),
    SpecialDefenseComparison: getHTMLInputElementValueFromForm(form, "specialDefenseEntryComparison"),
    Speed: getHTMLInputElementValueFromForm(form, "speedEntry"),
    SpeedComparison: getHTMLInputElementValueFromForm(form, "speedEntryComparison")
  }
  console.log(parameters);
}

function getHTMLInputElementValueFromForm(form: HTMLFormElement, element: string): string{
  return (form.elements[element as any] as HTMLInputElement).value;
}

window.onload = main;
