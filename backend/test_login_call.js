const axios = require('axios');

async function testLogin() {
    try {
        const loginData = {
            role: 'patient',
            identifier: '+916382715355',
            password: 'wrongpassword' // I don't know the real password
        };
        
        console.log('Testing login with:', loginData);
        
        const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
        console.log('Response:', response.data);
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', err.response?.data);
    }
}

testLogin();
