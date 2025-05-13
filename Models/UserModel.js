import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  nationalId: { type: String, required: true },
  password: { type: String, required: true },
  profilepic: { type: String , required:false },
  role : {type:String , required:true},

});

const UserModel=mongoose.model("Users",UserSchema,"Users");
export default UserModel;