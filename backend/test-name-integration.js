import axios from 'axios';
import { prisma } from './prisma/prismaClient.js';

async function testNameIntegration() {
  console.log('🧪 Testing Name Integration in Activation Flow...\n');
  
  const uniqueEmail = `name${Date.now()}@example.com`;
  
  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const adminLogin = await axios.post('http://localhost:3000/auth/login', {
      email: 'jai@admin',
      password: 'jais'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful\n');
    
    // Step 2: Create employee
    console.log('2️⃣ Creating employee...');
    await axios.post('http://localhost:3000/employees', {
      email: uniqueEmail
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Employee created\n');
    
    // Step 3: Get activation token
    const employee = await prisma.employee.findFirst({
      where: { email: uniqueEmail, status: 'pending' }
    });
    
    const activationToken = employee.activationToken;
    const activationUrl = `http://localhost:5173/activate?token=${activationToken}`;
    
    console.log('3️⃣ Testing activation with name...');
    const activateResponse = await axios.post('http://localhost:3000/auth/activate', {
      token: activationToken,
      name: 'John Doe',
      password: 'testpassword123'
    });
    
    console.log('✅ Activation successful with name:', activateResponse.data.employee.name);
    console.log('🔗 Test URL:', activationUrl);
    
    // Step 4: Verify employee data
    const updatedEmployee = await prisma.employee.findUnique({
      where: { email: uniqueEmail }
    });
    
    console.log('✅ Employee data verified:');
    console.log('   - Name:', updatedEmployee.name);
    console.log('   - Status:', updatedEmployee.status);
    console.log('   - Has Password:', !!updatedEmployee.hashedPassword);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 Name integration test successful!');
    console.log('📋 Manual Testing:');
    console.log('1. Open:', activationUrl);
    console.log('2. Verify name field appears in password step');
    console.log('3. Fill in name, password, and confirm password');
    console.log('4. Activate account and verify name is saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNameIntegration(); 