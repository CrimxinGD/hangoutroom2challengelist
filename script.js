/* ...existing code... */
/* Simple JS to allow adding/removing empty level cards */

const levelsContainer = document.getElementById('levels');
const addBtn = document.getElementById('add-level');
const clearBtn = document.getElementById('clear-levels');

function createEmptyCard(index){
  const article = document.createElement('article');
  article.className = 'level-card';
  article.dataset.index = index;

  const fields = ['Level Name','Level ID','Verifier and Creator','List Points'];
  fields.forEach(labelText=>{
    const row = document.createElement('div');
    row.className = 'row';

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = labelText;

    const value = document.createElement('span');
    value.className = 'value';
    value.textContent = ''; // intentionally blank

    row.appendChild(label);
    row.appendChild(value);
    article.appendChild(row);
  });

  return article;
}

/* new: populate a card element from JSON data (leaves blank values if fields missing) */
async function populateCardFromJSON(article){
  const index = article.dataset.index;
  try{
    const res = await fetch(`/level${index}.json`);
    if(!res.ok) throw new Error('not found');
    const data = await res.json();
    const rows = article.querySelectorAll('.row');
    const values = [
      data.name ?? '',
      data.id ?? '',
      data.verifier ?? '',
      Array.isArray(data.points) ? data.points.join(', ') : (data.points ?? '')
    ];
    rows.forEach((row, i) => {
      const valEl = row.querySelector('.value');
      valEl.textContent = values[i];
      valEl.style.color = values[i] ? 'var(--accent)' : 'transparent';
      valEl.style.background = values[i] ? 'transparent' : valEl.style.background;
      valEl.style.width = values[i] ? 'auto' : valEl.style.width;
    });
  }catch(e){
    // leave as empty visual placeholders if file missing or parse error
    console.warn(`Level ${index} JSON not loaded:`, e);
  }
}

/* Replace: on load, try to populate existing static cards from their JSON files
   New behavior: fetch list.json and only create/show cards for entries listed there.
*/
document.addEventListener('DOMContentLoaded', async ()=>{
  try{
    const res = await fetch('/list.json');
    const list = res.ok ? await res.json() : [];
    // Expect list to be array of filenames like "level3.json"
    // Clear any static cards in HTML and build from list
    levelsContainer.innerHTML = '';
    list.forEach((filename, i)=>{
      const match = filename.match(/level(\d+)\.json$/i);
      if(!match) return;
      const index = match[1];
      const card = createEmptyCard(index);
      levelsContainer.appendChild(card);
      populateCardFromJSON(card);
    });
  }catch(err){
    console.error('Failed to load list.json, no levels will be shown:', err);
    levelsContainer.innerHTML = ''; // fallback: show nothing
  }
});

addBtn.addEventListener('click', ()=>{
  const count = levelsContainer.children.length + 1;
  const newCard = createEmptyCard(count);
  levelsContainer.appendChild(newCard);
  // try loading JSON for newly added index
  populateCardFromJSON(newCard);
});

clearBtn.addEventListener('click', ()=>{
  // keep first 3 cards, remove the rest
  const keep = 3;
  const nodes = Array.from(levelsContainer.children);
  nodes.forEach((n, i)=>{
    if(i >= keep) n.remove();
  });
});
/* ...existing code... */