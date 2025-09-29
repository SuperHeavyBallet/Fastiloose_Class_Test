// Class Variables as Enums to avoid string typos
const WEIGHT = Object.freeze({ HEAVY : "heavy", LIGHT : "light"});
const ATK_RANGE = Object.freeze({ CLOSE : "close", LONG : "long"});
const ATK_SPREAD = Object.freeze({ NARROW : "narrow" , BROAD : "broad"});


const BASE_CLASS = Object.freeze({

    health : 5,
    move: 2,           // max squares per move
    atk_Range: 4,     // max squares for attacks
    atk_Splash: 0  ,   // atk_Splash radius (0 or 1 = single-target)
    atk_Damage: 1, // Damage Per Hit
    atk_Hit: 3,
    atk_Evade: 3,

});

const MODIFIERS= Object.freeze({
    [WEIGHT.HEAVY]: {  health: +1, move: -1, atk_Hit: +1, atk_Evade: -1 },
    [WEIGHT.LIGHT]: {  health: -1, move: +1, atk_Hit: -1, atk_Evade: +1},

    [ATK_RANGE.LONG]:   { atk_Range: +2 },
    [ATK_RANGE.CLOSE]:  { atk_Range: -2 },

    [ATK_SPREAD.NARROW]:{ atk_Splash: -BASE_CLASS.atk_Splash , atk_Damage: +1 },     // keeps atk_Splash at BASE (single-target)
    [ATK_SPREAD.BROAD]: { atk_Splash: +1 }      // +1 radius
});




// Optional cross-mod hooks (multi-axis synergies/penalties)
function crossModifiers({ weight, range, spread }) {

    const delta = { health: 0, move: 0, atk_Range: 0, atk_Splash: 0, atk_Damage: 0};

    // Archers
    if(range === ATK_RANGE.LONG && spread === ATK_SPREAD.NARROW && weight)
    {

        if(weight === WEIGHT.HEAVY)
        {
            delta.atk_Range +=1;
        }
        else
        {
            delta.atk_Damage -= 1;
        }
        
    }

    // Bomber
    if(range === ATK_RANGE.LONG && spread === ATK_SPREAD.BROAD)
    {
        
        if(weight === WEIGHT.HEAVY)
        {
            delta.atk_Range -=1;
            delta.atk_Damage += 1;
        }
        else
        {
            delta.atk_Range -=2;
        }
    }

    // Brawlers
    if(range === ATK_RANGE.CLOSE && spread === ATK_SPREAD.BROAD)
    {
        
        if(weight === WEIGHT.HEAVY)
        {
            delta.move +=1;
            delta.atk_Damage += 1;
        }
        else
        {
            delta.move +=1;
            delta.atk_Range -=1;
        }
    }

    // Dualists
    if(range === ATK_RANGE.CLOSE && spread === ATK_SPREAD.NARROW)
    {
        if(weight === WEIGHT.HEAVY)
        {
            delta.move +=1;
        }
        else
        {
            delta.move +=1;
            delta.atk_Damage -= 1;
            delta.atk_Range -=1;
        }
    } 


    
    

  return delta;
}







// Utility to add deltas
function apply(base, ...deltas) {

    return deltas.reduce((acc, d) => ({
      health:      acc.health      + (d.health      ?? 0),
      move:        acc.move        + (d.move        ?? 0),
      atk_Range:   acc.atk_Range   + (d.atk_Range ?? 0),
      atk_Splash:  acc.atk_Splash  + (d.atk_Splash ?? 0),
      atk_Damage:  acc.atk_Damage   + (d.atk_Damage ?? 0),
      atk_Hit:     acc.atk_Hit      +(d.atk_Hit ?? 0),
      atk_Evade:   acc.atk_Evade    +(d.atk_Evade ?? 0)
    }), { ...base });
  }

// Optional clamping to keep stats sane
function clamp(stats) {

    return {
      health:      Math.max(1, stats.health),
      move:        Math.max(1, stats.move),
      atk_Range: Math.max(1, stats.atk_Range),
      atk_Splash:      Math.max(0, stats.atk_Splash),
      atk_Damage: Math.max(1, stats.atk_Damage),
      atk_Hit: Math.max(1, stats.atk_Hit),
      atk_Evade: Math.max(1, stats.atk_Evade),
    };
}








// Factory: create a class build from knobs
function makeClass({ weight, range, spread, name }) {

    // Ensure supplied parameters are within the stat objects
    if (!Object.values(WEIGHT).includes(weight)) throw new Error("Bad weight");
    if (!Object.values(ATK_RANGE).includes(range))   throw new Error("Bad range");
    if (!Object.values(ATK_SPREAD).includes(spread)) throw new Error("Bad spread");


  
    const stats = clamp(apply(
      BASE_CLASS,
      MODIFIERS[weight],
      MODIFIERS[range],
      MODIFIERS[spread],
      crossModifiers({ weight, range, spread })
    ));
  
    return {
        name: name ?? `${weight}-${range}-${spread}`,
        tags: { weight, range, spread,  },
        stats
    };
}



  


  // Example: Heavy, Long, Narrow (Heavy Archer)
  const heavyArcher = makeClass({
    weight: WEIGHT.HEAVY,
    range:  ATK_RANGE.LONG,
    spread: ATK_SPREAD.NARROW,
    name:   "Heavy Marksman"
  });

  const lightArcher = makeClass({
    weight: WEIGHT.LIGHT,
    range: ATK_RANGE.LONG,
    spread: ATK_SPREAD.NARROW,
    name: "Light Marksman"
  });

  const heavyBomber = makeClass({
    weight: WEIGHT.HEAVY,
    range:  ATK_RANGE.LONG,
    spread: ATK_SPREAD.BROAD,
    name:   "Heavy Grenadier"
  });

  const lightBomber = makeClass({
    weight: WEIGHT.LIGHT,
    range:  ATK_RANGE.LONG,
    spread: ATK_SPREAD.BROAD,
    name:   "Light Grenadier"
  });

  const heavyDuelist = makeClass({
    weight: WEIGHT.HEAVY,
    range:  ATK_RANGE.CLOSE,
    spread: ATK_SPREAD.NARROW,
    name:   "Heavy Duelist"
  });

  const lightDuelist = makeClass({
    weight: WEIGHT.LIGHT,
    range: ATK_RANGE.CLOSE,
    spread: ATK_SPREAD.NARROW,
    name: "Light Duelist"
  });

  const heavyBrawler = makeClass({
    weight: WEIGHT.HEAVY,
    range:  ATK_RANGE.CLOSE,
    spread: ATK_SPREAD.BROAD,
    name:   "Heavy Bruiser"
  });

  const lightBrawler = makeClass({
    weight: WEIGHT.LIGHT,
    range:  ATK_RANGE.CLOSE,
    spread: ATK_SPREAD.BROAD,
    name:   "Light Bruiser"
  });

 

  document.addEventListener('DOMContentLoaded', () =>
  {
    /*
    createNewCard(heavyArcher);
    createNewCard(lightArcher);
    createNewCard(heavyBomber);
    createNewCard(lightBomber);
    createNewCard(heavyDuelist);
    createNewCard(lightDuelist);
    createNewCard(heavyBrawler);
    createNewCard(lightBrawler);*/

    const allBoardSquares = generateNewBoard(8);
  

    
   // DOM elements (never reassign these)
    const slot1El = document.getElementById("class1");
    const slot2El = document.getElementById("class2");

    // Which slot is currently selected (element)
    let currentSlotEl = slot1El;

    // The currently chosen unit for each slot (game data)
    const chosen = {
        1: heavyArcher,
        2: lightArcher
    };

    


    // --- selection UI ---
    function selectSlot(el) {
        [slot1El, slot2El].forEach(slot =>
        slot.classList.toggle("selected", slot === el)
        );
        currentSlotEl = el; // still an element
    }

    selectSlot(currentSlotEl); // init
    slot1El.addEventListener("click", () => selectSlot(slot1El));
    slot2El.addEventListener("click", () => selectSlot(slot2El));

    UpdateSelectedCard(chosen[1], true);

    const fateDeckStack = document.getElementById("fateDeck");
    const fateDeckTitle = document.getElementById("fateDeckTitle");
    const fateDeckGroup = document.getElementById("fateDeckGroup");
    const fateDeckDescription = document.getElementById("fateDeckDescription");

    function getCharClasses(){
        return fetch('resources/charClasses.json').then(res => res.json());
    }
    const toKey = s => String(s).trim().toUpperCase();

    let characterClasses;

    getCharClasses().then(allClasses => {
        characterClasses = allClasses.classes;

        characterClasses.forEach((charClass) => {
           


           
            
            
         
            let newClass = makeClass(
                {
                    weight: WEIGHT[toKey(charClass.weight)],
                    range: ATK_RANGE[toKey(charClass.range)],
                    spread: ATK_SPREAD[toKey(charClass.spread)],
                    name: charClass.name
                }
            );

            createNewCard(newClass);

        
        });
            

   

    })

    let fateDeckCards_All = [];
    let rareFateDeckCards = [];
    let uncommonFateDeckCards = [];
    let commonFateDeckCards = [];
    const STANDARD_DECK = { rare : 1, uncommon : 3, common : 5};
    const STANDARD_DECK_TYPES = {null : 8, fighter : 10, world : 6};

    let allNullCards = [];
    let allWorldCards = [];
    let allFighterCards = [];

    function getFateDeck() {
        return fetch('resources/fateDeckCards.json').then(res => res.json());
      }
      
      // Usage
      getFateDeck().then(deck => {
        fateDeckCards_All = deck.cards;
        let deckSize  = fateDeckCards_All.length

        fateDeckCards_All.forEach(card => {
            
            // Here we create sub groups based on Card Group type (Null, Fighter, World)
            switch(card.group)
            {
                case "null":
                    allNullCards.push(card); break;
                case "fighter":
                    allFighterCards.push(card); break;
                case "world":
                    allWorldCards.push(card); break;
                    default:
                        console.error("Error Sorting Cards into Groups");
            }

            
            switch(card.rarity)
            {
                case "rare":
                    rareFateDeckCards.push(card);
                    break;
                case "uncommon" :
                    uncommonFateDeckCards.push(card);
                    break;
                case "common" :
                    commonFateDeckCards.push(card);
                    break;
                default : commonFateDeckCards.push(card);
            }
        });

        

        let placedRareCards = 0;
        let placedUncommonCards = 0;
        let placedCommonCards = 0;
        let finalDeck = [];

        //The process we need
        // First, get seperate groups of null, world and figher effect cards
        // Then, within each group we need to build the contents of the null, world and fighter in the end deck
        // A full deck will have null : 8, fighter : 10, world : 6
        // null should have a decided distribution within that 8,
        // A rare in null is 10%, an uncommon is 30%, a common is 60%
        // Within 8 null, 8 / 0.10 = Rare dist, 8 / 0.30 = Unc Dist, 8 / 0.60 = Com Dist

        let nullDist = getGroupDistribution(allNullCards.length);
        console.log("Null: " + nullDist.rare + ", " + nullDist.uncommon + ", " + nullDist.common);
      

        //First, create the size of the deck goal (24 is standard)
        let goalDeckSize = STANDARD_DECK_TYPES.null + STANDARD_DECK_TYPES.fighter + STANDARD_DECK_TYPES.world;

        //Now, Get the distribution of rarities across the deck size
        let deckRatios = getGroupDistribution(goalDeckSize);
        let rareLimit = deckRatios.rare;
        let uncommonLimit = deckRatios.uncommon;
        let commonLimit = deckRatios.common;

        console.log("Rare: " + rareLimit + ", Unc: " + uncommonLimit + ", Com: " + commonLimit);








        for(let i = 0; i < STANDARD_DECK.rare; i++)
        {
            let randomInt = ChooseFateCard(rareFateDeckCards.length);
            finalDeck.push(rareFateDeckCards[randomInt]);
        }

        for(let i = 0; i < STANDARD_DECK.uncommon; i++)
        {
            let randomInt = ChooseFateCard(uncommonFateDeckCards.length);
            finalDeck.push(uncommonFateDeckCards[randomInt]);
        }

        for(let i = 0; i < STANDARD_DECK.common; i++)
        {
            let randomInt = ChooseFateCard(commonFateDeckCards.length);
            finalDeck.push(commonFateDeckCards[randomInt]);
        }



        

        let finalDeckSize = finalDeck.length;

        console.log(finalDeckSize);

        
        fateDeckStack.addEventListener("click", (e) => {
            e.preventDefault();
            let newCardNumber = ChooseFateCard(finalDeckSize);
            let chosenCard = finalDeck[newCardNumber]
    
            fateDeckGroup.textContent = `${chosenCard.group}`;
            fateDeckTitle.textContent = `${chosenCard.name}`;
            fateDeckDescription.textContent = `${chosenCard.description}`;
    
    
        });

      });

    function getGroupDistribution(groupSize) {
        const ratios = {
            common: 0.60,
            uncommon: 0.30,
            rare: 0.10
        };
    
        // Initial counts
        let counts = {
            common: Math.floor(groupSize * ratios.common),
            uncommon: Math.floor(groupSize * ratios.uncommon),
            rare: Math.floor(groupSize * ratios.rare),
        };
    
        // Handle rounding leftovers
        let total = counts.common + counts.uncommon + counts.rare;
        let remainder = groupSize - total;
    
        // Distribute leftovers to the largest categories first
        const order = ["common", "uncommon", "rare"];
        let i = 0;
        while (remainder > 0) {
            counts[order[i % order.length]]++;
            remainder--;
            i++;
        }
    
        return counts;
    }
    

    


    function ChooseFateCard(deckSize)
    {
        let number = Math.floor(Math.random()*deckSize);
        return number;
    }

    function createNewCard(newClass)
    {

        let cardHolder = document.getElementById("cardHolder");

        let classCard = document.createElement('div');
        classCard.classList.add("class-card");

        classCard.dataset.classID = newClass;

        createStat("h3", newClass.name, classCard);
        createStat("p", "HLTH: " + newClass.stats.health, classCard);
        createStat("p", "MOV: " + newClass.stats.move, classCard);
        createStat("p", "HIT: " + newClass.stats.atk_Hit, classCard);
        createStat("p", "DEF: " + newClass.stats.atk_Evade, classCard);

        createStat("p" , "DAMAGE: " + newClass.stats.atk_Damage,classCard);
        createStat("p", "RANGE: " + newClass.stats.atk_Range, classCard);
        let splashType = newClass.stats.atk_Splash === 0 ? "FOCUS" : "SPLASH";

        createStat("p", "TYPE: " + splashType, classCard);
       

        classCard.addEventListener('click', (e) =>
        {
            UpdateSelectedCard(newClass, false);
        })



        cardHolder.appendChild(classCard);

        

    }

   

    // --- when clicking a class card ---
    function UpdateSelectedCard(newClass, initial) {

        if(initial === true)
        {
            while (slot1El.firstChild) slot1El.removeChild(slot1El.lastChild);
            while (slot2El.firstChild) slot2El.removeChild(slot2El.lastChild);

            createStat("h3", chosen[1].name, slot1El);
            createStat("p", "HEALTH: " + chosen[1].stats.health, slot1El);
            createStat("p", "MOV: " + chosen[1].stats.move, slot1El);
            createStat("p", "HIT: " + chosen[1].stats.atk_Hit, slot1El);
            createStat("p", "DEF: " + chosen[1].stats.atk_Evade, slot1El);
            createStat("p", "DAMAGE: " + chosen[1].stats.atk_Damage, slot1El);
            createStat("p", "RANGE: " + chosen[1].stats.atk_Range, slot1El);
            let splashType1 = chosen[1].stats.atk_Splash === 0 ? "FOCUS" : "SPLASH";
            createStat("p", "TYPE: " + splashType1, slot1El);

            createStat("h3", chosen[2].name, slot2El);
            createStat("p", "HEALTH: " + chosen[2].stats.health, slot2El);
            createStat("p", "MOV: " + chosen[2].stats.move, slot2El);
            createStat("p", "HIT: " + chosen[2].stats.atk_Hit, slot2El);
            createStat("p", "DEF: " + chosen[2].stats.atk_Evade, slot2El);
            createStat("p", "DAMAGE: " + chosen[2].stats.atk_Damage, slot2El);
            createStat("p", "RANGE: " + chosen[2].stats.atk_Range, slot2El);    

            let splashType2 = chosen[2].stats.atk_Splash === 0 ? "FOCUS" : "SPLASH";
            createStat("p", "TYPE: " + splashType1, slot2El);
        }
        else
        {
            // which slot are we writing into?
        const slotId = currentSlotEl.dataset.id; // "1" or "2"
        chosen[slotId] = newClass;               // update game data
    
        // re-render that slot’s contents
        while (currentSlotEl.firstChild) currentSlotEl.removeChild(currentSlotEl.lastChild);
        createStat("h3", newClass.name, currentSlotEl);
        createStat("p", "HEALTH: " + newClass.stats.health, currentSlotEl);
        createStat("p", "MOV: " + newClass.stats.move, currentSlotEl);
        createStat("p", "HIT: " + newClass.stats.atk_Hit, currentSlotEl);
        createStat("p", "DEF: " + newClass.stats.atk_Evade, currentSlotEl);
        createStat("p", "DAMAGE: " + newClass.stats.atk_Damage, currentSlotEl);
        createStat("p", "RANGE: " + newClass.stats.atk_Range, currentSlotEl);
        

        let splashType = newClass.stats.atk_Splash === 0 ? "FOCUS" : "SPLASH";
            createStat("p", "TYPE: " + splashType,  currentSlotEl);
        
        
        }

        
        
        
    }


    //
    // ATTACK
    //

    let attackButton = document.getElementById("attackButton");
    let card1Roll = document.getElementById('card1Roll');
    let card2Roll = document.getElementById('card2Roll');
    let hitResult = document.getElementById('hitResult');

    attackButton.addEventListener("click", (e) => {
        e.preventDefault();
      
        const A = chosen[1];
        const D = chosen[2];
      
        const rollA = rollDice();
        const rollD = rollDice();
      
        const totalAttack = rollA + A.stats.atk_Hit;
        const totalEvade  = rollD + D.stats.atk_Evade;
      
        card1Roll.textContent = `${A.name} ATK : ${rollA} + ${A.stats.atk_Hit} : ${totalAttack}`;
        card2Roll.textContent = `${D.name} EVD : ${rollD} + ${D.stats.atk_Evade} : ${totalEvade}`;
      
        // attacker wins ties (your chosen rule)
        hitResult.textContent = (totalAttack >= totalEvade) ? "HIT!" : "MISS!";
      });

  });

  

  function createStat(elementType,text,parent)
  {
    let newStat = document.createElement(elementType);
    newStat.textContent = text;
    parent.appendChild(newStat);

  }

  function rollDice()
  {
    let resultNumber = 1 + Math.floor(Math.random()*6)

    return resultNumber;
  }

  //
  // BOARD
//

const BOARD_SQUARE = Object.freeze({
    pos: [0,0],
    hasLowTerrain: false,
    hasHighTerrain: false,
});


function generateNewBoard(sideLength) {
    const board = [];

    let boardContainer = document.getElementById("boardContainer");

    for (let i = 0; i < sideLength; i++) {
      const row = [];
      let rowElements = document.createElement("div");

      rowElements.classList.add("board-row");

      for (let j = 0; j < sideLength; j++) {

        let hasLowTerrain = false;
        let hasHighTerrain = false;

        if(i !== 0 && i !== sideLength -1)
        {
            let terrainRandomNumber =  1 + Math.floor(Math.random()*20)
            if (terrainRandomNumber === 1)
            {
                hasHighTerrain = true;
                hasLowTerrain = false;
            }
            else if(terrainRandomNumber === 2)
            {
                hasHighTerrain = false;
                hasLowTerrain = true;
            }
        }
        

        row.push(makeBoardSquare(i, j, hasLowTerrain, hasHighTerrain));
        let boardSquare = document.createElement("div");
        boardSquare.classList.add("board-square");
        
        if(hasLowTerrain)
        {
            boardSquare.textContent = "^"
            boardSquare.classList.add("low-terrain");
        }
        else if (hasHighTerrain)
        {
            boardSquare.textContent = "$"
            boardSquare.classList.add("high-terrain");
        }
        else{
            boardSquare.textContent = " "
            boardSquare.classList.add("empty");
        }

        rowElements.appendChild(boardSquare);

      }
      board.push(row); // use push, not add

      boardContainer.appendChild(rowElements);
    }
    return board;
  }

function makeBoardSquare(row, column, hasLowTerrain = false, hasHighTerrain = false) {
    return Object.freeze({
      pos: [row, column],
      hasLowTerrain,
      hasHighTerrain,
    });
  }




