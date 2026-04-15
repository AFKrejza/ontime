// source: https://gist.github.com/tpae/72e1c54471e88b689f85ad2b3940a8f0

class TrieNode {
	constructor(key) {
		this.key = key;
		this.parent = null;
		this.children = {};
		this.end = false;
	}
	getWord() {
		let output = [];
		let node = this;

		while (node && node.key !== null) {
			output.unshift(node.key);
			node = node.parent;
		}
		return output.join('');
	}
}

export class Trie {
	constructor() {
		this.root = new TrieNode(null);
	}
	insert(word) {
		let node = this.root;

		for (let i = 0; i < word.length; i++) {
			if (!node.children[word[i]]) {
				node.children[word[i]] = new TrieNode(word[i]);
				node.children[word[i]].parent = node;
			}

			node = node.children[word[i]];

			if (i == word.length - 1) {
				node.end = true;
			}
		}
	}
	contains(word) {
		let node = this.root;

		for (let i = 0; i < word.length; i++) {
			if (node.children[word[i]]) {
				node = node.children[word[i]];
			} else {
				return false;
			}
		}
		return node.end;
	}
	find(prefix) {
		let node = this.root;
		let output = [];

		for (let i = 0; i < prefix.length; i++) {
			if (node.children[prefix[i]]) {
				node = node.children[prefix[i]];
			} else {
				return output;
			}
		}
		findAllWords(node, output);
		return output;
	}
}

function findAllWords(node, arr) {
	if (node.end) {
		arr.unshift(node.getWord());
	}
	for (let child in node.children) {
		findAllWords(node.children[child], arr);
	}
}
