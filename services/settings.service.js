const settingsModel = require("../models/settings.model");

const fetchUser = async (userId) => {
  return settingsModel.fetchUser(userId)
};

const updateUser=async(fname,lname,password,linkedin, userId)=>{
  return settingsModel.updateUser(fname,lname,password,linkedin, userId)
}

const saveUserCV = async (userId, cvText) => {
  const existingCV = await settingsModel.getUserCV(userId);

  if (existingCV) {
    await settingsModel.updateUserCV(userId, cvText);
  } else {
    await settingsModel.insertUserCV(userId, cvText);
  }

  return true;
};

module.exports={
    fetchUser,
    updateUser,
    saveUserCV
}