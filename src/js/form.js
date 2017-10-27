var ip = require('ip');
var buildUrl = require('build-url');
var urlencode = require('urlencode');
var cookie = require('js-cookie');

var formWrapElement = document.querySelectorAll(".email-form")[0]
var formElement = document.querySelectorAll(".email-form__form")[0]
var emailField = document.querySelectorAll(".email-form__input--email")[0]
var submitButton = document.querySelectorAll(".email-form__input--sumbit")[0]
var successMessageElement = document.querySelectorAll(".email-form__success-message")[0]
var errorMessageElement = document.querySelectorAll(".email-form__error-message")[0]

var form_GUID = "582c4607-774f-491e-a22b-64454635cf70";
var HUB_ID = "3954379";
var URL = "https://forms.hubspot.com/uploads/form/v2/" +  HUB_ID + "/" + form_GUID;

var readCookie = cookie.get('hubspotutk')
var hutk = (readCookie) ? readCookie : ""

var ip = ip.address()
var redirectUrl = "https://hardwallet.status.im/welcome.html"

let data = {
    "hutk": hutk,
    "ipAddress": ip,
    "pageUrl": "https://status-im.github.io/hardwallet/",
    "pageName": "Status Hardwallet"
}

var hs_context = urlencode(JSON.stringify(data))


formElement.addEventListener("submit", function(evt) {
  evt.preventDefault()

  var emailValueEncoded;

  function validate() {
    var emailValue = emailField.value

    if(!isNotEmpty(emailValue)) {
      showError()
      return false
    }

    if(!isValidEmail(emailValue)) {
      showError()
      return false
    }

    emailValueEncoded = urlencode(emailValue)

    return emailValueEncoded
  }

  function isValidEmail(value) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(value)
  }

  function isNotEmpty(value) {
    if (value == "" || value == null) {
      return false
    }
    return true
  }

  function showError() {
    addClassToElement(formWrapElement, "email-form--error")
    setTimeout(function(){
			removeError()
		}, 600)
  }

  function removeError() {
    removeClassFromElement(formWrapElement, "email-form--error")
  }

  function disableFields() {
    emailField.disabled = true
    submitButton.disabled = true
    addClassToElement(formElement, "email-form--loading")
  }

  function enableFields() {
    emailField.disabled = false
    submitButton.disabled = false
    removeClassFromElement(formElement, "email-form--loading")
  }

  function showSuccessMessage() {
    disableFields()
    addClassToElement(successMessageElement, "email-form__success-message--shown")
  }

  function showErrorMessage() {
    addClassToElement(errorMessageElement, "email-form__error-message--shown")
  }

  if (validate()) {
    sendRequest()
  }

  //first check if Emils is not empty

  function sendRequest() {

    disableFields()

    var theUrlParams = buildUrl({
      queryParams: {
        email: emailValueEncoded,
        hs_context: hs_context
      }
    })

    var request = new XMLHttpRequest();

    request.open('POST', URL, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader('Access-Control-Allow-Origin', false);
    request.send(theUrlParams);

    request.onload = function() {
      enableFields()
      //204 when the form submissions is successful
      //302 when the form submissions is successful and a redirectUrl is included or set in the form settings.
      if(request.status == 204 || request.status == 302) {
        showSuccessMessage()
      } else {
        showErrorMessage()
      }
    }
  }
})


/*---Utils---*/
function addClassToElement(element, className) {
  (element.classList) ? element.classList.add(className) : element.className += ' ' + className
  return element
}

function removeClassFromElement(element, className) {
  if(element.classList) {
    element.classList.remove(className)
  } else {
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
  }
  return element
}
