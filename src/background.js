// chrome.runtime.onInstalled.addListener(()=> {
//     chrome.action.setBadgeText({
//         text:"ON",
//     })
// })

// const meet = 'https://meet.google.com/*'

// chrome.action.onClicked.addListener(async  (tab) => {
//     if (tab.url.startsWith(meet)){
//         // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
//         const prevState = await chrome.action.getBadgeText({
//             tabId: tab.id
//         });
//         // Next state will always be the opposite
//         const nextState = prevState === 'ON' ? 'OFF' : 'ON'

//         // Set the action badge to the next state
//         await chrome.action.setBadgeText({
//             tabId: tab.id,
//             text: nextState,
//         });
//         if (nextState === "ON"){

//             //open the camera
//             navigator.mediaDevices.getUserMedia({video: true})
//             .then(function(stream) {
//             console.log("I got the camera opened!");
//             // Attach the media stream to the video element
//             // video.srcObject = stream;
//             })
//             .catch(function(error) {
//                 console.error("Error accessing camera: ", error);
//             });        
//         } else if (nextState === "OFF"){
    
//             console.log("the camera was off!")
//         }
//     }
    
// })