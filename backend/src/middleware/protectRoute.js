import { requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      let user = await User.findOne({ clerkId });

      if (!user) {
        // fetch user details from Clerk and create in MongoDB
        const clerkUser = await clerkClient.users.getUser(clerkId);

        user = await User.create({
          clerkId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Anonymous",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          profileImage: clerkUser.imageUrl || "",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];