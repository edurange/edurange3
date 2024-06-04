import React, { useState, useEffect } from 'react';

class ChatTree {
    constructor(messages) {
        this.messages = new Map(messages.map(msg => [msg.message_uid, msg]));
    }

    // Finds the root message starting from any message in the thread using the message UID
    findRoot_fromMessageUID(messageUID) {
        let current = this.messages.get(messageUID);
        if (!current) return null;

        while (current.parent_uid) {
            current = this.messages.get(current.parent_uid);
        }
        return current;
    }

    // Builds an array from the root down through all descendants
    buildTree_fromRoot(rootUID) {
        const stack = [this.messages.get(rootUID)];
        const result = [];

        while (stack.length > 0) {
            const current = stack.pop();
            result.push(current);
            current.child_uid_array.forEach(childUID => {
                stack.push(this.messages.get(childUID));
            });
        }
        return result;
    }

    // Get the entire tree starting from any message in the thread using the message UID
    getFullThreadFromMessageUid(messageUid) {
        const root = this.findRoot_fromMessageUID(messageUid);
        if (!root) return []; // No root, return empty array
        return this.buildTree_fromRoot(root.message_uid);
    }
}

// testing
const messages = [
    { message_uid: '1', parent_uid: null, child_uid_array: ['2', '3'], thread_uid: 'threadthread', content: 'Root message' },
    { message_uid: '2', parent_uid: '1', child_uid_array: ['4'], thread_uid: 'threadthread', content: 'First reply' },
    { message_uid: '3', parent_uid: '1', child_uid_array: [], thread_uid: 'threadthread', content: 'Second reply' },
    { message_uid: '4', parent_uid: '2', child_uid_array: [], thread_uid: 'threadthread', content: 'Reply to first reply' }
];

const chatTree = new ChatTree(messages);
const fullThreadFromMessage = chatTree.getFullThreadFromMessageUid('4'); // Pass only the message UID
console.log(fullThreadFromMessage);
