import connectDB from "./config/db.js";
import Otp from "./models/Otp.js";
import "dotenv/config";

const run = async () => {
    await connectDB();
    const otp = await Otp.findOne({ email: "debug@test.com" }).sort({ createdAt: -1 });
    console.log("OTP FOUND:", otp?.otp);
    process.exit();
};
run();
