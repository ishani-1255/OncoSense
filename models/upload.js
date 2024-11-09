const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    fileType: {
        type: String,
        enum: ['image', 'pdf', 'text'] 
    },
    scanType: {
        type: String,
        enum: ['highLevel', 'lowLevel'] 
    },
    filePath: {
        type: String,
    },
    textInput: {
        type: String
    },
    cancerClass: {
        type: [String], 
        default: [],    
    },
    uploadDate: {
        type: Date,
        default: Date.now 
    }
});

// Create the Mongoose model from the schema
const CancerData = mongoose.model('Cancer Data', formDataSchema);

module.exports = CancerData;
