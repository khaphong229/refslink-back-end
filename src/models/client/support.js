import createModel from '../base'



const SupportSchema = {
  
    full_name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    }
}

const Support = createModel('Support','supports',SupportSchema)

export default Support