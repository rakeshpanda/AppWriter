const autocomplete = event => {
  let textVal = event.target.value;

  let start = event.target.selectionStart;
  const queryString = textVal.slice(0, start);

  log("start ", start, "queryString ", queryString);
  if (queryString && !/\s/.test(queryString.slice(-1))) {
    searchPredictions(queryString);
  } else {
    ul.innerHTML = "";
  }
};

const searchPredictions = _QUERY_STRING => {
  log("searchPredictions for ", _QUERY_STRING);
  const _LOCALE = getNavigatorLanguage().includes('da') ? _LOCALE_DA : _LOCALE_EN;
  log('_LOCALE', _LOCALE);
  const URL =
    "https://services.lingapps.dk/misc/getPredictions?locale=" +
    _LOCALE +
    "&text=" +
    _QUERY_STRING;

  fetchData(URL)
    .then(responseData => {
      log("server responseData ", responseData);
      buildSuggestList(responseData);
    })
    .catch(error => alert(error));
};

const buildSuggestList = responseData => {
  clearListItems();
  if (responseData && responseData.length) {
    for (var i = 0; i < 10 && i < responseData.length; i++) {
      const item = responseData[i];
      ul.appendChild(createListItem(item));
    }
  }
};

const createListItem = item => {
  const listItem = document.createElement("li");

  listItem.addEventListener("click", () => {
    onSelect();
  });
  const { sum, start } = findWordWithIndex();
  const wordIndex = sum ? start - sum : start;
  listItem.innerHTML = `<span style='font-weight: bold;'>${item.substring(
    0,
    wordIndex
  )}</span>${item.substring(wordIndex, item.length)}`;
  return listItem;
};

const onSelect = () => {
  insertAtCursor(event.target.textContent);
  clearListItems();
};

const clearListItems = () => {
  ul.innerHTML = "";
};

const insertAtCursor = insertText => {
  const { sum,row, word , strArr} = findWordWithIndex();
 strArr[row] = insertText;
    input.value = strArr.join(' ');
    input.focus();
    input.selectionStart = sum + insertText.length;
    input.selectionEnd = input.selectionStart ;
};

const findWordWithIndex = () => {
  let sum = 0,
    row = 0,
    start = input.selectionStart;
  const strArr = input.value.split(/\s/);
  while (start && sum < start && sum + strArr[row].length < start) {
    sum += strArr[row].length + 1;
    row++;
  }
  log('lastWordlength start selected word', sum, start, strArr[row])
  return { sum, start, row, word: strArr[row] , strArr};
};  

const getNavigatorLanguage = () => {
  if (navigator.languages && navigator.languages.length) {
    return navigator.languages[0];
  } else {
    return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
  }
}

const fetchData = (url) =>{
  return new Promise((resolve, reject) => {
      const HTTP = new XMLHttpRequest();
      HTTP.open('GET', url);
      HTTP.setRequestHeader('Authorization', 'Bearer MjAxOS0wMi0xNQ==.cmFrZXNocGFuZGEuZWVlLm5pdHRAZ21haWwuY29t.YzdlNjVjZmIzNTA1MTY0ODY2ODE0YjRmZjBiNmQxYjg=');
      HTTP.onreadystatechange = function() {
          if (HTTP.readyState == XMLHttpRequest.DONE && HTTP.status == 200) {
              const RESPONSE_DATA = JSON.parse(HTTP.responseText);
              resolve(RESPONSE_DATA);
          } else if (HTTP.readyState == XMLHttpRequest.DONE) {
              console.log('oops');
              reject('Something went wrong');
          }
      };
      HTTP.send();
  });
};

const log = (...msg) => {
   console.log(msg);
};

const input = document.querySelector("#input");
const ul = document.querySelector("ul");
const _LOCALE_EN = "en-GB";
const _LOCALE_DA = "da-DK";



input.addEventListener("keyup", autocomplete);
