const contactsModel = require("../models/contacts.model");

const getUserContacts=async(userId)=>{
  return contactsModel.fetchContacts(userId)
}

module.exports={
  getUserContacts
}