import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },
  favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],
  settings: {
    type: Object,
    default: {
      "--background-color": "#fff",
      "--background-light": "#fff",
      "--primary-color": "rgb(255, 0, 86)",
      "--shadow-color": "rgba(0,0,0,0.2)",
      "--text-color": "#0A0A0A",
      "--text-light": "#575757",
      "--font-size": "16px",
      "--animation-speed": 1,
    },
  },
});

export const UserModel = mongoose.model("users", UserSchema);