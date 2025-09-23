// Class Variables as Enums to avoid string typos
const WEIGHT = Object.freeze({ HEAVY : "heavy", LIGHT : "light"});
const ATK_RANGE = Object.freeze({ CLOSE : "close", LONG : "long"});
const ATK_SPREAD = Object.freeze({ NARROW : "narrow" , BROAD : "broad"});


const BASE_CLASS = Object.freeze({

    health : 5,
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

    [ATK_SPREAD.NARROW]:{ atk_Splash: 0 , atk_Damage: +1 },     // keeps atk_Splash at BASE (single-target)
    [ATK_SPREAD.BROAD]: { atk_Splash: +1 }      // +1 radius
});




// Optional cross-mod hooks (multi-axis synergies/penalties)
function crossModifiers({ weight, range, spread }) {

    const delta = { health: 0, move: 0, atk_Range: 0, atk_Splash: 0, atk_Damage: 0};

    if(range === ATK_RANGE.LONG && spread === ATK_SPREAD.NARROW)
    {
        delta.atk_Range +=1;
    }

    if(range === ATK_RANGE.LONG && spread === ATK_SPREAD.BROAD)
    {
        delta.atk_Range -=1;
    }

    
    /*

    These should be reconsidered, stick with the original Modifier Base System for now
    //
    if(spread === ATK_SPREAD.NARROW)
    {
        delta.atk_Damage += 1;
    }
    else if(spread === ATK_SPREAD.BROAD)
    {
        delta.atk_Damage -= 1;
    }
    // Long Distance, Sniper Types
    //
    // Heavy Archer
    if(weight === WEIGHT.HEAVY && range === ATK_RANGE.LONG && spread === ATK_SPREAD.NARROW)
    {
        delta.health += 1;
        delta.move -= 1;
        delta.atk_Range += 2;
        delta.atk_Splash = 0;
    }

    // Light Archer
    if(weight === WEIGHT.LIGHT && range === ATK_RANGE.LONG && spread === ATK_SPREAD.NARROW)
    {
        delta.health -= 1;
        delta.move += 1;
        delta.atk_Range += 1;
        delta.atk_Splash = 0;
    }

    //
    // Long Distance, Blast Types
    //
    // Heavy Bomber
    if(weight === WEIGHT.HEAVY && range === ATK_RANGE.LONG && spread === ATK_SPREAD.BROAD)
    {
        delta.health += 1;
        delta.move -= 1;
        delta.atk_Range += 1;
        delta.atk_Splash += 2;
    }

    // Light Bomber
    if(weight === WEIGHT.LIGHT && range === ATK_RANGE.LONG && spread === ATK_SPREAD.BROAD)
    {
        delta.health -= 1;
        delta.move += 1;
        delta.atk_Range += 0;
        delta.atk_Splash += 1;
    }

    // 
    // Short Distance, Wide Attack Types
    //
    // Heavy Brawler
    if(weight === WEIGHT.HEAVY && range === ATK_RANGE.CLOSE && spread === ATK_SPREAD.BROAD)
    {
        delta.health += 1;
        delta.move -= 1;
        delta.atk_Range -= 1;
        delta.atk_Splash += 2;
    }

    // Light Brawler
    if(weight === WEIGHT.LIGHT && range === ATK_RANGE.CLOSE && spread === ATK_SPREAD.BROAD)
    {
        delta.health -= 1;
        delta.move += 1;
        delta.atk_Range -= 1;
        delta.atk_Splash = 2;
    }

    //
    // Short Distance, Narrow Attack Types
    //
    // Heavy Dualist
    if(weight === WEIGHT.HEAVY && range === ATK_RANGE.CLOSE && spread === ATK_SPREAD.NARROW)
    {
        delta.health += 1;
        delta.move -= 1;
        delta.atk_Range -= 2;
        delta.atk_Splash = 0;
    }

    // Light Dualist
    if(weight === WEIGHT.LIGHT && range === ATK_RANGE.CLOSE && spread === ATK_SPREAD.NARROW)
    {
        delta.health -= 1;
        delta.move += 1;
        delta.atk_Range -= 2;
        delta.atk_Splash = 0;
    }*/

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

  /*
  console.log(heavyArcher);
  console.log(lightArcher);
  console.log(heavyBomber);
  console.log(lightBomber);

  console.log(heavyDuelist);
  console.log(lightDuelist);
  console.log(heavyBrawler);
  console.log(lightBrawler);
  */

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


  

  });

  function createNewCard(newClass)
  {
    let cardHolder = document.getElementById("cardHolder");

    let classCard = document.createElement('div');
    let className = document.createElement('h1');
    classCard.textContent = newClass.name;

    classCard.appendChild(className);

    cardHolder.appendChild(classCard);

    
  }

  
