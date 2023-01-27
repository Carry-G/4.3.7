const searchInput = document.querySelector('.search__input');
const searchList = document.querySelector('.search__list');
const addRepositories = document.querySelector('.repositories');

let mapRepos = new Map();
let viewedRepos = [];

async function serchRepository(query) {
  return await fetch(`https://api.github.com/search/repositories?q=${query}`)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {

      }
    }).then(res => res.items)
}

function debounce(callee, timeoutMs) {
  return function perform(...args) {
    let previousCall = this.lastCall
    this.lastCall = Date.now()
    if (previousCall && this.lastCall - previousCall <= timeoutMs) {
      clearTimeout(this.lastCallTimer)
    }
    this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs)
  }
}

function handleInput(e) {
  viewedRepos = [];
  let { value } = e.target;
  value = value.trim();

  if (!value) {
    searchList.innerHTML = ''
    return
  };

  if (mapRepos.has(value)) {
    addMap(value);
  }
  else {
    serchRepository(value).then(function (res) {
      viewedRepos = res.filter(item => {
        if (item.name.slice(0, value.length) === value) {
          return item
        }
      });

      mapRepos.set(value, viewedRepos);
      creatLi(viewedRepos);
    })
  }
}

function addMap(value) {
  let getMap = mapRepos.get(value);

  viewedRepos = getMap.filter(element => {
    if (element.name.slice(0, value.length) === value) {
      return element
    }
  });
  creatLi(viewedRepos);
}

function creatLi(data) {
  searchList.innerHTML = ''
  let count = 0;
  data.forEach(item => {
    if (count < 5) {
      searchList.insertAdjacentHTML('afterbegin', `<li id=${count}>${item.name}</li>`);
      count++;
    }
  });
}

const debouncedDoSomething = debounce(handleInput, 250);

searchInput.addEventListener('input', debouncedDoSomething);

searchList.addEventListener('click', function (e) {
  let typ = e.target;
  searchList.removeChild(typ);
  let user = viewedRepos[typ.id];
  addRepositories.insertAdjacentHTML('afterbegin', `<div class='children'>
    <span>Name: ${user.name}</span>
    <span>Owner: ${user.owner.login}</span>
    <span>Stars: ${user.stargazers_count}</span>
    <span class="remove">[ x ]</span></div>`
  );
  searchInput.value = '';
  searchList.innerHTML = '';
})

addRepositories.addEventListener('click', function (e) {
  if (e.target.className != 'remove') return;
  let children = e.target.closest('.children');
  children.remove();
})

