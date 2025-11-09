const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

class UserController {
  static async register(req, res) {
    try {
      const {
        fullName,
        email,
        password,
        confirmPassword,
        phone,
        address,
        gender,
        profileImage,
      } = req.body;

      if (!fullName || !email || !password || !confirmPassword)
        return res
          .status(400)
          .json({ message: "Please fill all required fields." });

      if (password !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match." });

      const existingUser = await User.findByEmail(email);
      if (existingUser)
        return res.status(400).json({ message: "Email already registered." });

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        fullName,
        email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        phone,
        address,
        gender,
        profileImage,
      };

      const newUserId = await User.create(userData);
      return res
        .status(201)
        .json({ message: "User registered successfully.", userId: newUserId });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res
          .status(400)
          .json({ message: "Email and password are required." });

      const user = await User.findByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found." });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(401).json({ message: "Invalid credentials." });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users." });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found." });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user." });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = await User.update(id, req.body);
      res.status(200).json({ message: "User updated successfully.", result });
    } catch (error) {
      res.status(500).json({ message: "Error updating user." });
    }
  }

  static async softDelete(req, res) {
    try {
      const { id } = req.params;
      await User.softDelete(id);
      res.status(200).json({ message: "User soft deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error soft deleting user." });
    }
  }

  static async hardDelete(req, res) {
    try {
      const { id } = req.params;
      await User.hardDelete(id);
      res.status(200).json({ message: "User permanently deleted." });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user." });
    }
  }
}

module.exports = UserController;
