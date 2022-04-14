// находим необходимые элементы
const input = document.querySelector(".input_search");
const outputData = document.querySelector(".output_search");
const btnClose = document.querySelector(".result_close");
const resultElement = document.querySelectorAll(".result_elem");
let outputResult = document.querySelector(".output_result");
let option = document.querySelector(".input_option");

// объявляем переменные
let map = new Map();
let search = "";

// Debounce
const debounce = (fn, debounceTime) => {
  let timeout;
  return function () {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, debounceTime);
  };
};

// Создание и добавление элемента
function creatElem(tagName, className) {
  let createElem = document.createElement(tagName);
  createElem.classList.add(className);
  return createElem;
}

// Отправляем запрос
async function getRepositoresOnGitHub(search) {
  const url = `https://api.github.com/search/repositories?q=${search}`;

  try {
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    console.error(err);
  }
}

// Подсказки
async function addList() {
  search = input.value.trim();

  if (search.length < 1) {
    removeList();
    return;
  }

  const repositories = await getRepositoresOnGitHub(search);

  if (option) {
    removeList();
  }

  let fragment = new DocumentFragment();

  for (let i = 0; i < 5; i++) {
    option = creatElem("div", "input_option");
    await option.append(repositories.items[i]["name"]);
    option.id = repositories.items[i]["id"];
    await map.set(option.id, repositories.items[i]);
    fragment.append(option);
  }
  outputData.append(fragment);
}

//удаление всплывающих элементов
function removeList() {
  const delEl = document.querySelectorAll(".input_option");
  delEl.forEach((el) => el.remove());
}

//добавлениие выбранных элементов в список
function createAddedElement(target) {
  let fragment = new DocumentFragment();
  
  let fixElem = creatElem("div", "result_elem");  

  let leftSide = creatElem("div", "result_main"); 

  let resName = creatElem("div", "result_name");
  resName.textContent = `Name: ${map.get(target).name}`;
  leftSide.append(resName);

  let resOwner = creatElem("div", "result_owner");
  resOwner.textContent = `Owner: ${map.get(target).owner.login}`;
  leftSide.append(resOwner);

  let resStars = creatElem("div", "result_stars");
  resStars.textContent = `Stars: ${map.get(target).stargazers_count}`;
  leftSide.append(resStars);

  let btnClose = creatElem("button", "result_close");

  fixElem.append(leftSide);
  fixElem.append(btnClose);
  fragment.append(fixElem);

  outputResult.append(fragment);

  btnClose.addEventListener("click",  () => {
    fixElem.remove();
  });   
}

input.addEventListener("input", debounce(addList, 500));

outputData.addEventListener("click", function handleClick(ev) {
  let target = ev.target;

  target.classList.add("input_option--active");

  createAddedElement(target.id); // добавляем элемент

  removeList(); // убираем подсказки

  input.value = ""; // чистим инпут
});

outputData.removeEventListener('click', handleClick);
