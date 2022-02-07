import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../model/userModel";
import crypto from "crypto";
import joi from "joi";
import { transporter } from "./userAuthController";
import PasswordResetToken from "../model/passwordResetModel";
import {
  validateChangePass,
  validatePasswordReset,
} from "../utils/validationFunction";


/*************** make a get reguest to get the link for the password reset vial email *****************/
export async function forgot_password(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schema = joi.object({ email: joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    const user = User.findOne(
      { email: req.body.email },
      async (err: any, user: any) => {
        if (!user) {
          return res
            .status(400)
            .json(
              "The email doesn't exist on our platform, Please check and retry"
            );
        }
        let token = await PasswordResetToken.findOne({ userId: user._id });
        if (!token) {
          token = await new PasswordResetToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        }
        const link = `${process.env.BASE_URL}/users/reset_password/${user._id}/${token.token}`;
        const mailOptions = {
          from: "Hademath",
          to: user.email,
          subject: "RESET PASSWORD LINK",
          text: "text",
          html: `<h1> please click on the url below to reset your password </h1>
                    <h3> The link sent will expire in 30 minute </3>
                <p style="color:red; font-size:26px;"><a href="${link}"><i class="fas fa-window-restore"></i>Reset Password </a> </p1>`,
        };
        transporter.sendMail(mailOptions, (err: any, info: any) => {
          if (err) {
            res.status(400).json(err.message);
            // console.log(err.messgae)
          } else {
            res
              .status(200)
              .json("Check your Email for the link to reset your password");
          }
        });
      }
    );
  } catch (error) {
    res.json("Internal Error Occured");
    console.log(error);
  }
}
export async function reset_password(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error } = validatePasswordReset(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json("Invalid user access");
    const token = await PasswordResetToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).json("Invalid link or expired");
    if (req.body.password !== req.body.passConfirm) {
      return res
        .status(405)
        .json("The password and confirm password does not match");
    } else {
      user.password = await bcrypt.hash(req.body.password, 10);
      await user.save();
      await token.delete();
      res.status(200).json("password reset sucessfully.");
    }
  } catch (error) {
    res.send("internal server error occured");
    console.log(error);
  }
}
export async function change_password(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error } = validateChangePass(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    const { userId } = req.params;
    
    const oldpass: any = await User.findById(userId);
    const validPasswords = await bcrypt.compare(
      req.body.oldpassword,
      oldpass.password
    )
    if (!validPasswords) {
      return res.status(405).json("the current password is incorrect");
    }
    if (req.body.password !== req.body.passConfirm) {
      return res
        .status(405)
        .json("The password and confirm password does not match");
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const userPassword = await User.findByIdAndUpdate(
      { _id: userId },
      { password: password }
    );
    res.status(200).json("user password changed successfully");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
}
