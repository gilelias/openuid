

function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}


function getFormFields(){
  var txtUsername = document.getElementById('txtUsername');
  var txtPassword = document.getElementById('txtPassword');
  var txtId = document.getElementById('txtId');
  var btnSave = document.getElementById('btnSave');
  var ckInstant = document.getElementById('ckInstant');

  return {
    txtUsername,
    txtPassword,
    txtId,
    btnSave,
    ckInstant
  }
}

function getLoginFromForm(){
  var { txtUsername, txtPassword, txtId, ckInstant } = getFormFields()

  return {
    username: txtUsername.value,
    password: txtPassword.value,
    id: txtId.value,
    ckInstant: ckInstant.checked
  }
}

function getLoginFromStorage(cb){
  chrome.storage.sync.get(['username', 'password', 'id', 'instant'], cb);
}

function saveLoginFormToStorage(cb){
  var { txtUsername, txtPassword, txtId, btnSave, ckInstant } = getFormFields();
  console.log(ckInstant.checked);
  chrome.storage.sync.set({
    username: txtUsername.value || '',
    password: txtPassword.value || '',
    id: txtId.value || '',
    instant: ckInstant.checked
  }, cb);
}


document.addEventListener('DOMContentLoaded', () => {
  var { txtUsername, txtPassword, txtId, btnSave, ckInstant } = getFormFields()

  getLoginFromStorage(items=>{
    txtUsername.value = items.username || '';
    txtPassword.value = items.password || '';
    txtId.value = items.id || '';
    ckInstant.checked = items.instant
  })

  btnSave.onclick = ()=> {
    saveLoginFormToStorage();
  }

  getCurrentTabUrl(function(url){
    if(url.indexOf("openu.ac.il") > -1){
      inject()
    }
  })
});


function inject(){
  getLoginFromStorage(items=>{
    if(items && items.username && items.password && items.id)
    code = buildSetValueByElementId('p_user', items.username) +
           buildSetValueByElementId('p_sisma', items.password) +
           buildSetValueByElementId('p_mis_student', items.id)

    if(items.instant){
      code += `document.getElementById("login_sso").submit()`;
    }

    chrome.tabs.executeScript(null, {
      code: code,
      allFrames: true,
      runAt: "document_end",
    })
  })
}

function buildSetValueByElementId(elementId, value){
  let eml = `document.getElementById('${elementId}')`;
  let code = `if(${eml}) ${eml}.value=${JSON.stringify(value)};`
  return code;
}
