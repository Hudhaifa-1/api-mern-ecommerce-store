<<<<<<< HEAD
import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		const conn = await mongoose.connect("mongodb+srv://hudhaifamuhammedi:6IfxaiOFtxrSRZvf@dbtestcluster.odvqppv.mongodb.net/db_test?retryWrites=true&w=majority&appName=dbTestCluster");
=======
export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI);
>>>>>>> 1604916a2c593e06c2e9592dc7a234f4376bfcba
		console.log(`✅ MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.log("Error connecting to MONGODB", error.message);
		process.exit(1);
	}
<<<<<<< HEAD
};
=======
};
>>>>>>> 1604916a2c593e06c2e9592dc7a234f4376bfcba
