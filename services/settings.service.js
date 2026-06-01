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
    return settingsModel.updateUserCV(userId, cvText);
  }

  return settingsModel.insertUserCV(userId, cvText);
};

const changeRefer=async(newPrivacy,userId)=>{
  return settingsModel.changeRefer(newPrivacy,userId)
}

module.exports={
    fetchUser,
    updateUser,
    saveUserCV,
    changeRefer
}
