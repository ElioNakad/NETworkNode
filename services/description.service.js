const descriptionModel = require("../models/description.model");

const getDescriptions=async(userId,contactId)=>{
  return descriptionModel.fetchContactDescriptions(userId,contactId)
}

const getDefaultDescriptions=async(userId)=>{
  return descriptionModel.fetchDefaultDescriptions(userId)
}

const insertDescriptions=async(user_contact_id,label,description)=>{
  return descriptionModel.insertContactDescriptions(user_contact_id,label,description)
}

const insertDefaultDescriptions=async(users_id,label,description)=>{
  return descriptionModel.insertDefaultDescriptions(users_id,label,description)
}

module.exports={
  getDescriptions,
  getDefaultDescriptions,
  insertDescriptions,
  insertDefaultDescriptions
}