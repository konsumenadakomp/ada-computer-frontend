import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('k0n5um3n7', salt);

    const result = await User.findOneAndUpdate(
      { username: 'admin' },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin'
        }
      },
      { new: true }
    );

    if (result) {
      console.log('Admin password updated successfully');
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdmin(); 