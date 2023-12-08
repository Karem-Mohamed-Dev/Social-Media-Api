require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('common'));


const authRouter = require("./routes/auth");


app.use("/api/auth", authRouter);


app.use((req, res, next) => {
    res.status(404).json({ msg: "Route Not Found" });
})

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const msg = error.message || "Something Went Wrong";
    console.log(error)
    res.status(statusCode).json({ msg })
})

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(port, console.log("Server Is Running..."));
    } catch (error) {
        console.log(error);
    }
};

start();