import mongoose from "mongoose"

export const dbConnection = async () => {
    try {
        const dbconn = await mongoose.connect(process.env.MONGOOSE_URL)
        console.log("Succcessfully connected to Database", dbconn.connection.port)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}