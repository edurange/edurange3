


// export function restoreChatSession() {

//     const chatSession_string = localStorage.getItem('chatSession');
//     if (!chatSession_string) { return false; };
//     const chatSession = JSON.parse(chatSession_string);

//     const chatSession_expiry = chatSession.expiry;
//     if (!chatSession_expiry) { return false; };
//     if (chatSession_expiry < Date.now()) { return false; };

//     console.log("previous chat session found in localStorage.  restoring...")
//     return chatSession;
// };