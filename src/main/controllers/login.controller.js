const bcrypt = require("bcrypt");
const userModel = require('../models/user.model')
// const { checkLoginUser } = require("./user.controller");

module.exports.loginUser = async (req, res) => {
  try {
    const { username, password } = res;
    if (!username || !password) {
      return { status: 401, message: "Please add all fields" };
    }

    const user = await userModel.findOne({username:username})
    
    if (!user) {
      return { status: 405, message: "Please add all fields" };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { status: 404, message: "No validate password" };
    }

    const successUser = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
    return { status: 200, message: "success", args: JSON.parse(JSON.stringify(successUser)) };
  } catch (error) {
    return { status: 500, message: error };
  }
};
