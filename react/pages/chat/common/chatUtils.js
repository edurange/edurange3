import { customAlphabet } from "nanoid";

const adjectives = [
    "Happy", "Bright", "Calm", "Daring", "Fabulous",
    "Gentle", "Hopeful", "Inventive", "Joyful", "Lively", "Merry", "Nimble",
    "Quick", "Radiant", "Thoughtful", "Upbeat", 
    "Vibrant", "Zealous", "Wily", "Brave",
    "Clever", "Determined", "Energetic", "Jovial", "Keen", "Loyal"
];
const nouns = [
    "Panda", "Eagle", "Tiger", "Lion", "Dolphin", "Cat", "Swan", "Puma",
    "Penguin", "Koala", "Elephant", "Giraffe", "Leopard", "Flamingo", "Hedgehog",
    "Kangaroo", "Otter", "Raccoon", "Chipmunk", "Meerkat", "Falcon", "Parrot",
    "Hummingbird", "Pelican", "Owl", "Zebra", "Sealion", "Wolf", "Bear", "Rabbit",
    "Frog", "Turtle", "Deer", "Cheetah", "Horse", "Stoat", "Gazelle", "Whale",
    "Seahorse", "Butterfly"
];
const alphaNums = 'abcdefghijklmnopqrstuvwxyz0123456789';
const chatSession_lifespan = (1000 * 60 * 60 * 6); // 6 hr in miliseconds

export function generateAlias() {
    const randomAdjIndex = Math.floor(Math.random() * adjectives.length);
    const randomNounIndex = Math.floor(Math.random() * nouns.length);

    const randomAdjective = adjectives[randomAdjIndex];
    const randomNoun = nouns[randomNounIndex];

    return `${randomAdjective}${randomNoun}`;
}
export function generateInt(){
    return Math.floor(1000 + Math.random() * 9000);
}
export class ChatUser {
    constructor (userID, isInstructor){
        this.userID = userID || generateInt();
        this.isInstructor = isInstructor || false;
        this.userAlias = generateAlias();
    }
}
export class ChatMessage {
    constructor(chatSessionObj, chatUserObj, scenarioID, timeStamp, messageID, content) {
        this.chatUserObj = chatUserObj;
        this.chatSessionObj = chatSessionObj;
        this.scenarioID = scenarioID;
        this.timeStamp = timeStamp || new Date().getTime().toString();
        this.messageID = messageID || `${generateInt()}`;
        this.content = content || "I love edurange";
        this.secret = "halloweenTrampoline5647382910"
    }
}
export class ChatSession {
    constructor() {
        this.sessionID = generateInt(); // arbitrary int
        this.created = new Date().getTime().toString();
        this.expiry = (new Date().getTime() + chatSession_lifespan).toString();
    }
}

export function restoreChatSession() {

    // console.log('Checking for previous chat session in localStorage...');

    const chatSession_string = localStorage.getItem('chatSession');
    if (!chatSession_string) { return false; };
    const chatSession = JSON.parse(chatSession_string);

    const chatSession_expiry = chatSession.expiry;
    if (!chatSession_expiry) { return false; };
    if (chatSession_expiry < Date.now()) { return false; };

    console.log("previous chat session found in localStorage.  restoring...")
    return chatSession;
};