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
    constructor(channel_id, user_alias, scenario_type, content, scenario_id, scenario_name) {
        this.scenario_id = Number(scenario_id);
        this.scenario_type = scenario_type;
        this.scenario_name = scenario_name ?? "undefined";
        this.content = content || "I love edurange";
        this.user_alias = user_alias;
        this.channel_id = Number(channel_id);
    }
}