// Class Variables as Enums to avoid string typos
const WEIGHT = Object.freeze({ HEAVY : "heavy", LIGHT : "light"});
const ATK_RANGE = Object.freeze({ CLOSE : "close", LONG : "long"});
const ATK_SPREAD = Object.freeze({ NARROW : "narrow" , BROAD : "broad"});


const BASE_CLASS = Object.freeze({

    health : 4,
    move: 2,           // max squares per move
    atk_Range: 5,     // max squares for attacks
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
    name:   "Heavy Archer"
  });

  const lightArcher = makeClass({
    weight: WEIGHT.LIGHT,
    range: ATK_RANGE.LONG,
    spread: ATK_SPREAD.NARROW,
    name: "Light Archer"
  });

  const heavyBomber = makeClass({
    weight: WEIGHT.HEAVY,
    range:  ATK_RANGE.LONG,
    spread: ATK_SPREAD.BROAD,
    name:   "Heavy Bomber"
  });

  const lightBomber = makeClass({
    weight: WEIGHT.LIGHT,
    range:  ATK_RANGE.LONG,
    spread: ATK_SPREAD.BROAD,
    name:   "Light Bomber"
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
    name:   "Heavy Brawler"
  });

  const lightBrawler = makeClass({
    weight: WEIGHT.LIGHT,
    range:  ATK_RANGE.CLOSE,
    spread: ATK_SPREAD.BROAD,
    name:   "Light Brawler"
  });

 

  document.addEventListener('DOMContentLoaded', () =>
  {
    createNewCard(heavyArcher);
    createNewCard(lightArcher);
    createNewCard(heavyBomber);
    createNewCard(lightBomber);
    createNewCard(heavyDuelist);
    createNewCard(lightDuelist);
    createNewCard(heavyBrawler);
    createNewCard(lightBrawler);

    const allBoardSquares = generateNewBoard(8);
    console.log(allBoardSquares);

    
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




    function createNewCard(newClass)
    {

        let cardHolder = document.getElementById("cardHolder");

        let classCard = document.createElement('div');
        classCard.classList.add("class-card");

        classCard.dataset.classID = newClass;

        let className = createStat("h3", newClass.name, classCard);
        let classHealth = createStat("p", "Health: " + newClass.stats.health, classCard);
        let classMove = createStat("p", "Move: " + newClass.stats.move, classCard);
        let classAttack_Damage = createStat("p" , "Atk_Damage: " + newClass.stats.atk_Damage,classCard);
        let classSplash = createStat("p", "Atk_Splash: " + newClass.stats.atk_Splash, classCard);
        let classAttack_Range = createStat("p", "Atk Range: " + newClass.stats.atk_Range, classCard);
        let classHit = createStat("p", "Hit: " + newClass.stats.atk_Hit, classCard);
        let classEvade = createStat("p", "Evade: " + newClass.stats.atk_Evade, classCard);

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
            createStat("p", "Health: " + chosen[1].stats.health, slot1El);
            createStat("p", "Move: " + chosen[1].stats.move, slot1El);
            createStat("p", "Atk_Damage: " + chosen[1].stats.atk_Damage, slot1El);
            createStat("p", "Atk_Splash: " + chosen[1].stats.atk_Splash, slot1El);
            createStat("p", "Atk_Range: " + chosen[1].stats.atk_Range, slot1El);
            createStat("p", "Hit: " + chosen[1].stats.atk_Hit, slot1El);
            createStat("p", "Evade: " + chosen[1].stats.atk_Evade, slot1El);

            createStat("h3", chosen[2].name, slot2El);
            createStat("p", "Health: " + chosen[2].stats.health, slot2El);
            createStat("p", "Move: " + chosen[2].stats.move, slot2El);
            createStat("p", "Atk_Damage: " + chosen[2].stats.atk_Damage, slot2El);
            createStat("p", "Atk_Splash: " + chosen[2].stats.atk_Splash, slot2El);
            createStat("p", "Atk_Range: " + chosen[2].stats.atk_Range, slot2El);
            createStat("p", "Hit: " + chosen[2].stats.atk_Hit, slot2El);
            createStat("p", "Evade: " + chosen[2].stats.atk_Evade, slot2El);
        }
        else
        {
            // which slot are we writing into?
        const slotId = currentSlotEl.dataset.id; // "1" or "2"
        chosen[slotId] = newClass;               // update game data
    
        // re-render that slot’s contents
        while (currentSlotEl.firstChild) currentSlotEl.removeChild(currentSlotEl.lastChild);
        createStat("h3", newClass.name, currentSlotEl);
        createStat("p", "Health: " + newClass.stats.health, currentSlotEl);
        createStat("p", "Move: " + newClass.stats.move, currentSlotEl);
        createStat("p", "Atk_Damage: " + newClass.stats.atk_Damage, currentSlotEl);
        createStat("p", "Atk_Splash: " + newClass.stats.atk_Splash, currentSlotEl);
        createStat("p", "Atk_Range: " + newClass.stats.atk_Range, currentSlotEl);
        createStat("p", "Hit: " + newClass.stats.atk_Hit, currentSlotEl);
        createStat("p", "Evade: " + newClass.stats.atk_Evade, currentSlotEl);
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




