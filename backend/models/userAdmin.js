import mongoose from 'mongoose';

const userAdmin = new mongoose.Schema({
    fullname: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    phoneNumber: {
        type: Number,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['admin','user'],
        default: 'user'
    },

    image: {
        type: String,
        required: false
    },
    
    // content: [
    //     {
    //         type: String
    //     }
    // ],
    // startTime:{
    //     type: Number,
    //     required:false
    // },
    // endTime:{
    //     type: Number,
    //     required:false
    // }
    content: [
        {
            taskName: {
                type: String,
            },
            startTime: {
                type: Date,  // Start time as number (milliseconds or hours, depending on use case)
                required: false
            },
            endTime: {
                type: Date,  // End time as number
                required: false
            },
            totalTime: {
                type: String,  // Total time as number
                required: false
            }
        }
    ],
})

export const userAdminModel = mongoose.model("userAdminModel", userAdmin);




