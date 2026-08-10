const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);
    console.log('\nUse this in your SQL INSERT statements');
}

hashPassword();

