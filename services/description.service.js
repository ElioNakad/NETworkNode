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

const getDefaultDescriptionsForContact = async (viewerUserId, phone) => {
  return descriptionModel.fetchDefaultDescriptionsForContact(
    viewerUserId,
    phone
  );
};

const deleteManualDescription=async(id)=>{
  return descriptionModel.deleteManualDescription(id)
}

const deleteDefaultDescription=async(id)=>{
  return descriptionModel.deleteDefaultDescription(id)
}
module.exports={
  getDescriptions,
  getDefaultDescriptions,
  insertDescriptions,
  insertDefaultDescriptions,
  getDefaultDescriptionsForContact,
  deleteManualDescription,
  deleteDefaultDescription
}