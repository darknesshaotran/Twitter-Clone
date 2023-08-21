/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */


function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) {
      return parts.pop().split(";").shift();
  }
}


function getTokenFromCookie() {
  var accessToken = getCookie("accessToken");
  return accessToken || null;
}

var token = getTokenFromCookie();

fetch('http://localhost:3000/users/me', {
    headers: new Headers({
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
  })
  .then((response) => response.json())
  .then((response) => {
    var receiver_id  = response.result._id != '64c085550db5a3eee4acfe62' ? '64c085550db5a3eee4acfe62' : '64b561c72a914b785a5693d6'
    fetch(`http://localhost:3000/conversation/receiver/${receiver_id}?limit=10&page=1`, {
    headers: new Headers({
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
  })
  .then((a) => a.json())
  .then((a)=>{
    console.log(a)
    var message = ''
    for ( let i = 0; i < a.conversations.length; i++){
      if(a.conversations[i].sender_id === response.result._id)
      {
        message+=`<li style="color:white;padding:10px;margin-bottom:5px;background:blue;border-radius:10px">${response.result.name}(${response.result._id}): ${a.conversations[i].content}</li>`
      }
      else {
        message+=`<li style="color:white;padding:10px;margin-bottom:5px;background:grey;border-radius:10px"> (${a.conversations[i].receiver_id}): ${a.conversations[i].content}</li>`
      }
    }
    list.innerHTML = message
  })
    const btn = document.getElementById('btn')
    const input = document.getElementById('input')
    const list = document.getElementById('list')
    
    console.log(response.result)
    alert(`hello ${response.result.name}`)
    const socket = io('http://localhost:3000')
    socket.auth =  {
      _id : response.result._id,
    }
    socket.on('connect',()=>console.log('user connect'))
    
    socket.on('receive privateMessage', (e)=> {
      var message = list.innerHTML
      message += `<li style="color:white;padding:10px;margin-bottom:5px;background:grey;border-radius:10px">${e.nameSender} (${e.from}): ${e.content}</li>`
      list.innerHTML = message
    })
///////////////////////////////////////////
    btn.onclick = () => {
      var value = input.value
      input.value = ''
      var message = list.innerHTML
      message += `<li style="color:white;padding:10px;margin-bottom:5px;background:blue;border-radius:10px">${response.result.name}(${response.result._id}): ${value}</li>`
      list.innerHTML = message
      var id  = response.result._id != '64c085550db5a3eee4acfe62' ? '64c085550db5a3eee4acfe62' : '64b561c72a914b785a5693d6'
      socket.emit("privateMessage",{content: value, to:id, from:response.result._id ,nameSender: response.result.name})
      
    }
  })