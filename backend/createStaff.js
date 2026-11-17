
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createStaff() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const name = "Staff";
        const email = "staff@gmail.com";
        const password = "Staff@12345";

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("Staff account already exists!");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Staff Account Created Successfully!");
        console.log("Email:", email);
        console.log("Password:", password);

    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createStaff().then(() => {
    console.log("Staff creation process finished.");
    process.exit(0);
}).catch((error) => {
    console.log("Error:", error.message);
    process.exit(1);
});
