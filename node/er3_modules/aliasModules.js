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

function genAlias() {
    const randomAdjIndex = Math.floor(Math.random() * adjectives.length);
    const randomNounIndex = Math.floor(Math.random() * nouns.length);

    const randomAdjective = adjectives[randomAdjIndex];
    const randomNoun = nouns[randomNounIndex];

    return `${randomAdjective}${randomNoun}`;
}

module.exports = { genAlias };
