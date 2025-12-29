const descriptionModel = require("../models/description.model");

const getDescriptions=async(userId,contactId)=>{
  return descriptionModel.fetchContactDescriptions(userId,contactId)
}

const insertDescriptions=async(user_contact_id,label,description)=>{
    return descriptionModel.insertContactDescriptions(user_contact_id,label,description)
}

module.exports={
  getDescriptions,
  insertDescriptions
}