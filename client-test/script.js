/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */

function getAccessTokenFromQuery() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('access_token');
}

async function getverifyTokenFromQuery() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  if (urlParams.get('token')) {
    const response = await fetch('http://localhost:3000/users/verify-email',{method:'POST', body: JSON.stringify({Email_verify_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGZkODdmNWMyYTQ5ZWQ4ODZiZTlkNTciLCJ2ZXJpZnkiOjAsInR5cGUiOjMsImlhdCI6MTY5NDMzNzAxNCwiZXhwIjoxNjk1MjAxMDE0fQ.Ht0lYyRq3g-QZIbhX2LRxQ3ZxUdW1KUHZzA38nVeoeo'})}) 

  }
}
const a = getverifyTokenFromQuery() 


const accessToken = getAccessTokenFromQuery();
if (accessToken) {
  const a = getTokenFromCookie()
  if (a === null) {
    document.cookie = `accessToken= Bearer ${accessToken}`
    // Tải lại trang hiện tại
  location.reload();

  }
  // 2. Lưu access token vào một cookie
  
}


function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) {
      return parts.pop().split(";").shift();
  }
}


// function getTokenFromCookie() {
//   var accessToken = getCookie("accessToken");
//   return accessToken || null;
// }

// var token = getTokenFromCookie();

// fetch('http://localhost:3000/users/me', {
//     headers: new Headers({
//       'Authorization': token,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     })
//   })
//   .then((response) => response.json())
//   .then((response) => {
//     var receiver_id  = response.result._id != '64f302a64784c7ffcbb73273' ? '64f302a64784c7ffcbb73273' : '64c085550db5a3eee4acfe62'
//     fetch(`http://localhost:3000/conversation/receiver/${receiver_id}?limit=10&page=1`, {
//     headers: new Headers({
//       'Authorization': token,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     })
//   })
//   .then((a) => a.json())
//   .then((a)=>{
//     console.log(a)
//     var message = ''
//     for ( let i = a.conversations.length-1; i >= 0; i--){
//       if(a.conversations[i].sender_id === response.result._id)
//       {
//         message+=`<li style="color:white;padding:10px;margin-bottom:5px;background:blue;border-radius:10px">${response.result.name}(${a.conversations[i].sender_id}): ${a.conversations[i].content}</li>`
//       }
//       else {
//         message+=`<li style="color:white;padding:10px;margin-bottom:5px;background:grey;border-radius:10px"> (${a.conversations[i].sender_id}): ${a.conversations[i].content}</li>`
//       }
//     }
//     list.innerHTML = message
//   })
//     const btn = document.getElementById('btn')
//     const input = document.getElementById('input')
//     const list = document.getElementById('list')
    
//     console.log(response.result)
//     alert(`hello ${response.result.name}`)
//     const socket = io('http://localhost:3000')
//     socket.auth =  {
//       // _id : response.result._id,
//        Authorization: token
//     }
//     socket.on('connect_error',(error)=>console.log(error.data))
//     socket.on('connect',()=>console.log('user connect'))
    
//     socket.on('receive_Message', (data)=> {
//       var message = list.innerHTML
//       const { payload } = data
//       message += `<li style="color:white;padding:10px;margin-bottom:5px;background:grey;border-radius:10px">${payload.nameSender} (${payload.sender_id}): ${payload.content}</li>`
//       list.innerHTML = message
//     })
// ///////////////////////////////////////////
//     btn.onclick = () => {
//       var value = input.value
//       input.value = ''
//       var message = list.innerHTML
//       message += `<li style="color:white;padding:10px;margin-bottom:5px;background:blue;border-radius:10px">${response.result.name}(${response.result._id}): ${value}</li>`
//       list.innerHTML = message
//       var receiver_id  = response.result._id != '64f302a64784c7ffcbb73273' ? '64f302a64784c7ffcbb73273' : '64c085550db5a3eee4acfe62'
//       const payload = {
//         sender_id: response.result._id,
//         receiver_id: receiver_id,
//         content: value
//       }
//       socket.emit("sendMessage",{payload: payload})
      
//     }
//   })