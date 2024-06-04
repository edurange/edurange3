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
export function genInt() {
    return Math.floor(1000 + Math.random() * 9000);
}
export function genAlias() {
    const randomAdjIndex = Math.floor(Math.random() * adjectives.length);
    const randomNounIndex = Math.floor(Math.random() * nouns.length);

    const randomAdjective = adjectives[randomAdjIndex];
    const randomNoun = nouns[randomNounIndex];

    return `${randomAdjective}${randomNoun}`;
}

export class ChatMessage {
    constructor(channel_id, thread_uid, parent_uid, user_alias, scenario_type, content, scenario_id) {
        this.scenario_id = Number(scenario_id);
        this.scenario_type = String(scenario_type);
        this.content = String(content) || "I love edurange";
        this.user_alias = String(user_alias);
        this.channel_id = Number(channel_id);
        this.thread_uid = String(thread_uid);
        this.message_uid = generateAlphanum(12);
        this.parent_uid = parent_uid ?? null;
        this.child_uid_array = [];
    }
}

export function generateAlphanum(length) {
    const alphanums = '1234567890abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphanums.length);
        result += alphanums[randomIndex];
    }
    return result;
}
