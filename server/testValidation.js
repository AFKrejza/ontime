// testValidation.js
// Standalone test runner — exercises every compiled schema with valid + invalid
// inputs and reports pass/fail counts. No HTTP server required, no external deps
// beyond what your project already has after `npm install`.
//
// Run with:  node testValidation.js
//
// Place this file at the project root (same folder as app.js).

import { validators, validate } from "./src/validation.js";

let pass = 0;
let fail = 0;
const failures = [];

function check(label, fn) {
	try {
		const ok = fn();
		if (ok) {
			pass++;
		} else {
			fail++;
			failures.push(label);
			console.log(`  FAIL  ${label}`);
		}
	} catch (err) {
		fail++;
		failures.push(`${label} (threw: ${err.message})`);
		console.log(`  ERROR ${label}: ${err.message}`);
	}
}

function expectValid(schemaName, data, label) {
	check(`[valid]   ${schemaName} :: ${label}`, () => {
		const ok = validators[schemaName](data);
		if (!ok) console.log(`    errors:`, validators[schemaName].errors.map(e => e.message));
		return ok === true;
	});
}

function expectInvalid(schemaName, data, label, expectedKeyword) {
	check(`[invalid] ${schemaName} :: ${label}`, () => {
		const ok = validators[schemaName](data);
		if (ok) return false;
		if (expectedKeyword) {
			const matched = (validators[schemaName].errors || []).some(
				(e) => e.message && e.message.toLowerCase().includes(expectedKeyword.toLowerCase())
			);
			if (!matched) {
				console.log(`    expected error containing "${expectedKeyword}", got:`,
					validators[schemaName].errors.map(e => e.message));
			}
			return matched;
		}
		return true;
	});
}

// ---------- AUTH: signup ----------
console.log("\n--- signup ---");
expectValid("signup",   { userName: "alice_01",  email: "a@b.co", password: "Password123" }, "happy path");
expectValid("signup",   { userName: "bob-99",    email: "b@c.io", password: "abcdefg1"     }, "minimum-length password");
expectInvalid("signup", {},                                                                   "empty body",                "required");
expectInvalid("signup", { userName: "ab",        email: "a@b.co", password: "Password123" }, "username too short",        "at least 3");
expectInvalid("signup", { userName: "alice!",    email: "a@b.co", password: "Password123" }, "username bad char",         "letters, numbers");
expectInvalid("signup", { userName: "a".repeat(51), email: "a@b.co", password: "Password123" }, "username too long",       "at most 50");
expectInvalid("signup", { userName: "alice_01",  email: "not-email", password: "Password123" }, "bad email",               "valid email");
expectInvalid("signup", { userName: "alice_01",  email: "a@b.co",  password: "short1"      }, "password too short",        "at least 8");
expectInvalid("signup", { userName: "alice_01",  email: "a@b.co",  password: "noNumbers"   }, "password missing number",   "letter and one number");
expectInvalid("signup", { userName: "alice_01",  email: "a@b.co",  password: "12345678"    }, "password missing letter",   "letter and one number");
expectInvalid("signup", { userName: "alice_01",  email: "a@b.co",  password: "Password123", extra: "x" }, "unknown field", "unknown field");

// ---------- AUTH: login ----------
console.log("\n--- login ---");
expectValid("login",   { email: "a@b.co", password: "anything-goes" }, "happy path");
expectInvalid("login", { email: "a@b.co" },                            "missing password",  "password is required");
expectInvalid("login", { password: "x" },                              "missing email",     "email is required");
expectInvalid("login", { email: "bad", password: "x" },                "bad email",         "valid email");

// ---------- GATEWAY: register ----------
console.log("\n--- gatewayRegister ---");
expectValid("gatewayRegister",   { gatewayId: "c1895bf80e2b", gatewayName: "Living Room" }, "happy path");
expectInvalid("gatewayRegister", { gatewayId: "C1895BF80E2B", gatewayName: "x" },           "uppercase hex",   "hexadecimal");
expectInvalid("gatewayRegister", { gatewayId: "tooshort",     gatewayName: "x" },           "id too short",    "hexadecimal");
expectInvalid("gatewayRegister", { gatewayId: 12345,          gatewayName: "x" },           "id wrong type",   "must be a string");
expectInvalid("gatewayRegister", { gatewayId: "c1895bf80e2b", gatewayName: "   " },         "whitespace name", "whitespace");
expectInvalid("gatewayRegister", { gatewayId: "c1895bf80e2b", gatewayName: "a".repeat(101) }, "name too long", "at most 100");

// ---------- GATEWAY: check ----------
console.log("\n--- gatewayCheck ---");
expectValid("gatewayCheck",   { gatewayId: "c1895bf80e2b" }, "happy path");
expectInvalid("gatewayCheck", { gatewayId: "nope" },         "bad id", "hexadecimal");

// ---------- GATEWAY: assigntowers ----------
console.log("\n--- gatewayAssignTowers ---");
expectValid("gatewayAssignTowers",   { gatewayId: "c1895bf80e2b", towerIds: ["547c65321d0b"] }, "single tower");
expectValid("gatewayAssignTowers",   { gatewayId: "c1895bf80e2b", towerIds: ["547c65321d0b", "0123456789ab"] }, "multi towers");
expectInvalid("gatewayAssignTowers", { gatewayId: "c1895bf80e2b", towerIds: [] },               "empty array",       "at least one");
expectInvalid("gatewayAssignTowers", { gatewayId: "c1895bf80e2b", towerIds: "not-array" },      "not an array",      "must be an array");
expectInvalid("gatewayAssignTowers", { gatewayId: "c1895bf80e2b", towerIds: ["BADID"] },        "bad item",          "hexadecimal");
expectInvalid("gatewayAssignTowers", { gatewayId: "c1895bf80e2b", towerIds: ["547c65321d0b", "547c65321d0b"] }, "duplicates", "duplicates");

// ---------- GATEWAY: rename ----------
console.log("\n--- gatewayRename ---");
expectValid("gatewayRename",   { name: "Kitchen Display" }, "happy path");
expectInvalid("gatewayRename", { name: "" },                "empty",      "must not be empty");
expectInvalid("gatewayRename", {},                          "missing",    "name is required");

// ---------- GATEWAY: health ----------
console.log("\n--- gatewayHealth ---");
expectValid("gatewayHealth",   { gatewayId: "c1895bf80e2b", towerId: "547c65321d0b", charge: 0   }, "min charge");
expectValid("gatewayHealth",   { gatewayId: "c1895bf80e2b", towerId: "547c65321d0b", charge: 100 }, "max charge");
expectValid("gatewayHealth",   { gatewayId: "c1895bf80e2b", towerId: "547c65321d0b", charge: 47.3 }, "fractional");
expectInvalid("gatewayHealth", { gatewayId: "c1895bf80e2b", towerId: "547c65321d0b", charge: -1   }, "below min", "at least 0");
expectInvalid("gatewayHealth", { gatewayId: "c1895bf80e2b", towerId: "547c65321d0b", charge: 101  }, "above max", "at most 100");
expectInvalid("gatewayHealth", { gatewayId: "c1895bf80e2b", towerId: "547c65321d0b", charge: "50" }, "string num", "must be a number");

// ---------- TOWER: addAssignment ----------
console.log("\n--- towerAddAssignment ---");
expectValid("towerAddAssignment",   { departureOffset: -10, lineId: 1, stopId: 1200 }, "happy path");
expectValid("towerAddAssignment",   { departureOffset: 0,   lineId: 1, stopId: 1200 }, "zero offset (boundary)");
expectInvalid("towerAddAssignment", { departureOffset: 1,   lineId: 1, stopId: 1200 }, "positive offset", "0 or negative");
expectInvalid("towerAddAssignment", { departureOffset: -10, lineId: 0, stopId: 1200 }, "lineId zero",     "positive integer");
expectInvalid("towerAddAssignment", { departureOffset: -10, lineId: 1, stopId: -5  }, "negative stopId", "positive integer");
expectInvalid("towerAddAssignment", { departureOffset: -10, lineId: 1.5, stopId: 1 }, "non-integer line","integer");
expectInvalid("towerAddAssignment", { departureOffset: -10, lineId: "1", stopId: 1 }, "string line",     "integer");
expectInvalid("towerAddAssignment", {},                                                "empty body",      "required");

// ---------- TOWER: rename ----------
console.log("\n--- towerRename ---");
expectValid("towerRename",   { name: "Front Door" }, "happy path");
expectInvalid("towerRename", { name: "  " },         "whitespace only", "whitespace");

// ---------- TOWER: param validation ----------
console.log("\n--- towerIdParam ---");
expectValid("towerIdParam",   { towerId: "547c65321d0b" }, "happy path");
expectInvalid("towerIdParam", { towerId: "INVALID" },      "bad id", "hexadecimal");

console.log("\n--- assignmentIdParam ---");
expectValid("assignmentIdParam",   { towerId: "547c65321d0b", assignmentId: "42" }, "happy path");
expectInvalid("assignmentIdParam", { towerId: "547c65321d0b", assignmentId: "0"  }, "zero id",   "positive");
expectInvalid("assignmentIdParam", { towerId: "547c65321d0b", assignmentId: "-1" }, "negative",  "positive");
expectInvalid("assignmentIdParam", { towerId: "547c65321d0b", assignmentId: "abc"}, "non-num",   "positive");

// ---------- USER: update ----------
console.log("\n--- userUpdate ---");
expectValid("userUpdate",   { username: "alice_01" },                    "username only");
expectValid("userUpdate",   { email: "a@b.co" },                         "email only");
expectValid("userUpdate",   { username: "alice_01", email: "a@b.co" },   "both");
expectInvalid("userUpdate", {},                                          "empty body",     "at least one");
expectInvalid("userUpdate", { username: "ab" },                          "username short", "at least 3");
expectInvalid("userUpdate", { email: "bad" },                            "bad email",      "valid email");
expectInvalid("userUpdate", { username: "alice_01", garbage: 1 },        "extra field",    "unknown field");

// ---------- Middleware factory ----------
console.log("\n--- validate() middleware ---");
function runMw(mw, req) {
	return new Promise((resolve) => {
		const res = {
			status(c) { this._c = c; return this; },
			json(b)   { resolve({ status: this._c, body: b, next: false }); }
		};
		mw(req, res, () => resolve({ status: 200, body: null, next: true }));
	});
}

(async () => {
	const r1 = await runMw(validate("signup"),
		{ body: { userName: "alice_01", email: "a@b.co", password: "Password123" } });
	check("middleware: valid signup calls next()", () => r1.next === true && r1.status === 200);

	const r2 = await runMw(validate("signup"), { body: { email: "bad" } });
	check("middleware: invalid signup returns 400", () => r2.status === 400 && Array.isArray(r2.body.errors));

	const r3 = await runMw(validate("gatewayCheck", "body.data"),
		{ body: { data: { gatewayId: "c1895bf80e2b" } } });
	check("middleware: body.data source works", () => r3.next === true);

	const r4 = await runMw(validate("towerAddAssignment", "body.assignment"),
		{ body: { assignment: { departureOffset: -5, lineId: 1, stopId: 9 } } });
	check("middleware: body.assignment source works", () => r4.next === true);

	const r5 = await runMw(validate("towerIdParam", "params"),
		{ params: { towerId: "547c65321d0b" } });
	check("middleware: params source works", () => r5.next === true);

	// --- Final summary ---
	console.log(`\n========================================`);
	console.log(`Pass: ${pass}    Fail: ${fail}    Total: ${pass + fail}`);
	console.log(`========================================`);
	if (failures.length) {
		console.log("\nFailures:");
		failures.forEach((f) => console.log(`  - ${f}`));
		process.exit(1);
	}
	process.exit(0);
})();
