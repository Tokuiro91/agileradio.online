import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "Tokuirotokuiro@gmail.com",
        pass: "whtk yhbc xmyo tpyc"
    }
});

async function main() {
    console.log("Sending...");
    try {
        const info = await transporter.sendMail({
            from: '"Test" <Tokuirotokuiro@gmail.com>',
            to: "Tokuirotokuiro@gmail.com", // sending to self
            subject: "Test Email",
            text: "This is a test from Node."
        });
        console.log("Success:", info.messageId);
    } catch(err) {
        console.error("Error:", err);
    }
}

main();
