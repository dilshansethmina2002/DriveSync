// =============================================================
//  Generate a TEST JWT so you can try this service in Postman
//  even when the Auth Service (Member 1) is not running.
//
//  Usage:
//    npm run token                          -> Customer token, random user id
//    npm run token -- Admin                 -> Admin token
//    npm run token -- Customer 665f1c2a9b1e8a0012345678   -> fixed user id
//
//  The token has the SAME shape the Auth Service creates:
//    { user: { id, role } }   signed with JWT_SECRET, valid for 1 day
//  For the final demo, log in through the Auth Service instead.
// =============================================================
import 'dotenv/config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const role = process.argv[2] || 'Customer';
const id = process.argv[3] || crypto.randomBytes(12).toString('hex'); // looks like a Mongo ObjectId

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Create your .env file first.');
  process.exit(1);
}

const token = jwt.sign({ user: { id, role } }, process.env.JWT_SECRET, { expiresIn: '1d' });

console.log(`\nRole:    ${role}`);
console.log(`User id: ${id}`);
console.log(`\nToken (paste into Postman -> Authorization -> Bearer Token):\n\n${token}\n`);
