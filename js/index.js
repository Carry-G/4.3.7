const searchInput = document.querySelector('.search__input');
const searchList = document.querySelector('.search__list');
const addRepositories = document.querySelector('.repositories');
const searchSpan = document.querySelector('.search__span');
let mapRepos = new Map();
let viewedRepos = [];

async function serchRepository(query) {
  return await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        searchSpan.textContent = 'Небольшая ошибка. Перезагрузите страницу'
        searchList.innerHTML = ''
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
  searchSpan.textContent = "";
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

      repositoryNotFound() ;
      mapRepos.set(value, viewedRepos);
      creatRepository(viewedRepos);
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
  creatRepository(viewedRepos);
}

function creatRepository(data) {
  searchList.innerHTML = ''
  let count = 0;
  data.forEach(item => {
      searchList.insertAdjacentHTML('afterbegin', `<li id=${count}>${item.name}</li>`);
      count++;
  });
}

function repositoryNotFound() {
  if (viewedRepos.length === 0) {
    searchSpan.textContent = 'Репозиторий по данному запросу не найден';
  }

}

function CreatSelectedRep(e){
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
}

const debouncedDoSomething = debounce(handleInput, 250);

searchInput.addEventListener('input', debouncedDoSomething);

searchList.addEventListener('click', CreatSelectedRep.bind(this));
searchList.removeEventListener('click', CreatSelectedRep)

addRepositories.addEventListener('click', function (e) {
  if (e.target.className != 'remove') return;
  let children = e.target.closest('.children');
  children.remove();
})

