import dotenv from 'dotenv';
import { initializeFirebase } from '../config/firebase.js';
import { getAuth } from 'firebase-admin/auth';

dotenv.config({ path: '.env.local' });

const createAuthUser = async () => {
  try {
    console.log('🔐 Creating Firebase Authentication user...');

    await initializeFirebase();
    const auth = getAuth();

    const email = 'admin@scallywags.com';
    const password = 'admin123';
    const displayName = 'Admin Manager';

    try {
      // Try to create the user
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true,
      });

      console.log(`✅ Successfully created user: ${userRecord.email}`);
      console.log(`   UID: ${userRecord.uid}`);

      // Set custom claims for admin role
      await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
      console.log('✅ Admin role assigned');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists, updating...');
        const user = await auth.getUserByEmail(email);

        // Update password
        await auth.updateUser(user.uid, {
          password: password,
          emailVerified: true,
        });

        // Set custom claims
        await auth.setCustomUserClaims(user.uid, { role: 'admin' });
        console.log('✅ User updated and admin role assigned');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 Authentication setup complete!');
    console.log('You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error creating auth user:', error.message);
    process.exit(1);
  }
};

createAuthUser();
