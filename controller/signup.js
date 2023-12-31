const bcrypt = require('bcryptjs');
const { PutItemCommand} = require("@aws-sdk/client-dynamodb");
const {dynamoDb}= require("../awsClients.js");
const jwt = require("jsonwebtoken")

const signUpHandeler= async (req, res) => {

    const { username, email, password } = req.body;
    if (!username || !email || !password){
        res.status(404).json({message:"credential errors"})
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const params = {
        TableName: 'User',  
        Item: {
            email: { S: email },
            username: { S: username },
            password: { S: hashedPassword }
        },
       // ConditionExpression: 'attribute_not_exists(email)'
    };
    console.log(params)
    try {
        const putCommand = new PutItemCommand(params); 
        await dynamoDb.send(putCommand);
        // Create a JWT
        const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
            expiresIn: '1h'  // Token expires in 1 hour
        });

        res.json({ token });

    } catch (error) {
        console.error('Error storing data in DynamoDB', error);
        res.status(500).json({ messgae: 'Error signing up' });
    }
}

module.exports =signUpHandeler