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
  const HEAVY_MARKSMAN = makeClass({
    weight: WEIGHT.HEAVY,
    range:  ATK_RANGE.LONG,
    spread: ATK_SPREAD.NARROW,
    name:   "Heavy Marksman"
  });

  const LIGHT_MARKSMAN = makeClass({
    weight: WEIGHT.LIGHT,
    range: ATK_RANGE.LONG,
    spread: ATK_SPREAD.NARROW,
    name: "Light Marksman"
  });


 

 

  document.addEventListener('DOMContentLoaded', () =>
  {

    const allBoardSquares = generateNewBoard(8);
 
   // DOM elements (never reassign these)
    const slot1El = document.getElementById("class1");
    const slot2El = document.getElementById("class2");

    // Which slot is currently selected (element)
    let currentSlotEl = slot1El;

    // The currently chosen unit for each slot (game data)
    const chosen = {
        1: HEAVY_MARKSMAN,
        2: LIGHT_MARKSMAN
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
    const fateDeckRarity = document.getElementById("fateDeckRarity");

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
    let chaoticFateDeck = [];
    let quietChaosFateDeck = [];
    let balancedFateDeck = [];
    let workingFateDeck = [];

    let allNullCards = [];
    let allWorldCards = [];
    let allFighterCards = [];
    const STANDARD_DECK_SIZE = 24;
    const STANDARD_NULL_SIZE = 6;
    const STANDARD_FIGHTER_SIZE = 10;
    const STANDARD_WORLD_SIZE = 8;

    function getFateDeck() {
        return fetch('resources/fateDeckCards.json').then(res => res.json());
      }
      
      // Usage
      getFateDeck().then(deck => {
        fateDeckCards_All = deck.cards;
      

        let indexes = [...Array(fateDeckCards_All.length).keys()]; // [0,1,2,...,N-1]

        // Fisher–Yates shuffle
        for (let i = indexes.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }

        // Take the first STANDARD_DECK_SIZE indexes
        let selectedIndexes = indexes.slice(0, STANDARD_DECK_SIZE);

        // Build your deck
        let chaoticFateDeck = selectedIndexes.map(i => fateDeckCards_All[i]);

        console.log("CHAOTIC FATE");
        console.log(chaoticFateDeck);

        // Creating Organised Fate Decks

        


        
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

        });



        // Creating Quiet Chaos Fate Deck

        let quietChaosNullCards =[];
        buildQuietChaosDeck(quietChaosFateDeck, STANDARD_NULL_SIZE, allNullCards);
        let quietChaosFighterCards = [];
        buildQuietChaosDeck(quietChaosFateDeck, STANDARD_FIGHTER_SIZE, allFighterCards)
        let quietChaosWorldCards = [];
        buildQuietChaosDeck(quietChaosFateDeck, STANDARD_WORLD_SIZE, allWorldCards);

        function buildQuietChaosDeck(endDeck, typeSize, sourceCards)
        {
          

            for (let i = 0; i < typeSize; i++)
            {
                let randomInt = ChooseFateCard(sourceCards.length);
                endDeck.push(sourceCards[randomInt]);
            }
            

        }

        console.log("QUIET CHAOS");
        console.log(quietChaosFateDeck);
     

        
        // Creating Order Chaost Fate Deck

        let sortedNullCards = [];
        let sortedFighterCards = [];
        let sortedWorldCards = [];

        let nullCardRarityDistribution =  { common: 6, uncommon: 0, rare: 0 };
        let fighterCardRarityDistribution = getGroupDistribution(STANDARD_FIGHTER_SIZE);
        let worldCardRarityDistribution = getGroupDistribution(STANDARD_WORLD_SIZE);


        let sortedRarityNullCards = {
            common : GetCardsByRarity(allNullCards, "common"),
            uncommon : null,
            rare : null,
        }

        let sortedRarityFighterCards = {
            common : GetCardsByRarity(allFighterCards, "common"),
            uncommon : GetCardsByRarity(allFighterCards, "uncommon"),
            rare : GetCardsByRarity(allFighterCards, "rare"),
        }

        let sortedRarityWorldCards = {
            common : GetCardsByRarity(allWorldCards, "common"),
            uncommon : GetCardsByRarity(allWorldCards, "uncommon"),
            rare : GetCardsByRarity(allWorldCards, "rare"),
        }

        function GetCardsByRarity(inputGroup, rarity)
        {
            let rarityGroup = [];

            for(let i = 0; i < inputGroup.length; i++)
            {
                if(inputGroup[i].rarity === rarity)
                {
                    rarityGroup.push(inputGroup[i]);
                }
            }

            return rarityGroup;
        }

  

        SortCardsRandomByRarity(nullCardRarityDistribution.common, sortedRarityNullCards.common, sortedNullCards);

        SortCardsRandomByRarity(fighterCardRarityDistribution.common, sortedRarityFighterCards.common, sortedFighterCards);
        SortCardsRandomByRarity(fighterCardRarityDistribution.uncommon, sortedRarityFighterCards.uncommon, sortedFighterCards);
        SortCardsRandomByRarity(fighterCardRarityDistribution.rare, sortedRarityFighterCards.rare, sortedFighterCards);

        SortCardsRandomByRarity(worldCardRarityDistribution.common, sortedRarityWorldCards.common, sortedWorldCards);
        SortCardsRandomByRarity(worldCardRarityDistribution.uncommon, sortedRarityWorldCards.uncommon, sortedWorldCards);
        SortCardsRandomByRarity(worldCardRarityDistribution.rare, sortedRarityWorldCards.rare, sortedWorldCards);

        function SortCardsRandomByRarity(typeRarityCount, sortedCardsRarity, endCardTypes)
        {

        
            for(let i = 0; i < typeRarityCount; i++)
            {
                let randomInt = ChooseFateCard(sortedCardsRarity.length);
                endCardTypes.push(sortedCardsRarity[randomInt]);
            }
        }

        let balancedFateDeck = sortedNullCards.concat(sortedFighterCards, sortedWorldCards);
        console.log("BALANCED FATE");
        console.log(balancedFateDeck);

        let finalDeck = chaoticFateDeck;

        let chaosFateButton = document.getElementById("chaosFateButton");
        let quietFateButton = document.getElementById("quietFateButton");
        let balancedFateButton = document.getElementById("balancedFateButton");
        let deckTypeText = document.getElementById("deckTypeText");

        chaosFateButton.addEventListener("click", (e) => {
            e.preventDefault();

            deckTypeText.textContent = "CHAOS";
            finalDeck = chaoticFateDeck;
        });

        quietFateButton.addEventListener("click", (e) => {
            e.preventDefault();

            deckTypeText.textContent = "QUIET";
            finalDeck = quietChaosFateDeck;
        });

        balancedFateButton.addEventListener("click", (e) => {
            e.preventDefault();

            deckTypeText.textContent = "BALANCE";
            finalDeck = balancedFateDeck;
        });

        

        


        fateDeckStack.addEventListener("click", (e) => {
            e.preventDefault();
            let newCardNumber = ChooseFateCard(finalDeck.length);
            let chosenCard = finalDeck[newCardNumber]
    
            fateDeckGroup.textContent = `${chosenCard.group}`;
            fateDeckRarity.textContent = `${chosenCard.rarity}`;
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

        if(counts.rare == 0)
        {
            counts.rare = 1;
            counts.uncommon = counts.uncommon -1;
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




