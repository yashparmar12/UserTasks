import { userAdminModel } from "../models/userAdmin.js";
import SECRET_KEY from "../jwtKey.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dummy } from "./dummy.js";
import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";
import { parse } from "json2csv";



export const register = async (req, res) => {
  const {
    fullname,
    email,
    address,
    phoneNumber,
    city,
    country,
    password,
    confirmPassword,
    role,
  } = req.body;
  try {
    if (
      !fullname ||
      !email ||
      !address ||
      !phoneNumber ||
      !city ||
      !country ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    const user = await userAdminModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exist with this email",
        success: false,
      });
    }

    const newPassword = password === confirmPassword;
    if (!newPassword) {
      return res.status(400).json({
        message: "Password is not matching",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userCreate = new userAdminModel({
      fullname,
      email,
      address,
      phoneNumber,
      city,
      country,
      password: hashPassword,
      role,
    });

    userCreate.save();

    res.status(201).json({
      message: "Account created successfully",
      success: true,
      user: userCreate,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    let user = await userAdminModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Incorrect email",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect password",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .json({ message: "Login successfully", user, success: true, token });
  } catch (error) {
    console.log(error);
  }
};

export const userData = async (req, res) => {
  try {
    const userId = req.id;
    let userData = await userAdminModel.findById(userId);

    if (!userData) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    if (userData.role === "admin") {
      let allUsers = await userAdminModel.find();

      return res.status(200).json({
        message: "All Users data fetched successfully",
        user: allUsers,
        adminuser: userData,
        success: true,
      });
    }

    return res.status(200).json({
      message: "User data fetched successfully",
      user: userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const userDataById = async (req, res) => {
  try {
    const paramsId = req.params.userId;

    let userData = await userAdminModel.findById(paramsId);

    if (!userData) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User data fetched successfully",
      user: userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { fullname, address, city, country, phoneNumber } = req.body;
    let user = await userAdminModel.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    if (req.file) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY ,
      });

      const result = await cloudinary.uploader.upload(req.file.path);
      user.image = result.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.address = address || user.address;
    user.city = city || user.city;
    user.country = country || user.country;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: {
        fullname: user.fullname,
        email: user.email,
        address: user.address,
        city: user.city,
        country: user.country,
        phoneNumber: user.phoneNumber,
        // photo: user.photo?.image,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const allUserData = async (req, res) => {
  try {
    let userData = await userAdminModel.find();

    if (!userData) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User data fetched successfully",
      user: userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const forgetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    let user = await userAdminModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email",
        success: false,
      });
    }

    const newPassword = password === confirmPassword;
    if (!newPassword) {
      return res.status(400).json({
        message: "Password is not matching",
        success: false,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({
      message: "Password update successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const uploadPhoto = async (req, res) => {
  const id = req.id;
  try {
    cloudinary.uploader.upload(req.file.path, function (error, result) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error",
        });
      }
      userAdminModel.findByIdAndUpdate(
        id,
        {
          photo: {
            image: result.secure_url,
            publicId: result.public_id,
          },
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "uploaded",
        // data: userPhoto,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (req, res) => {
  const { ids } = req.body;
  try {
    const deleteUsers = await userAdminModel.deleteMany({
      _id: { $in: ids },
      role: { $ne: "admin" },
    });

    if (deleteUsers) {
      res.status(200).json({ message: "Users deleted successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const dummyData = async (req, res) => {
  try {
    const ans = await userAdminModel.insertMany(dummy);
      
    if(ans){
      res.status(200).json({ message: "Data inserted successfully" });
    }else{
      res.status(500).json({ message: "not able to" });

    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error inserting data" });
  }
};

export const searchData = async (req, res) => {
  try {
    const { searchInput } = req.body;
    if (!searchInput) {
      return res.status(400).json({
        message: "Search input is empty",
        success: false,
      });
    }

    const users = await userAdminModel.aggregate([
      {
        $match: {
          $or: [
            {
              fullname: {
                $regex: searchInput,
                $options: "i",
              },
            },
            {
              city: {
                $regex: searchInput,
                $options: "i",
              },
            },
            {
              country: {
                $regex: searchInput,
                $options: "i",
              },
            },
          ],
        },
      },
    ]);

    if (!users) {
      return res.status(400).json({
        message: "Not able to fetch search data",
        success: false,
      });
    }
    if (users) {
      res.status(200).json({
        message: "Users fetched successfully",
        userData: users,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const task = async (req, res) => {
  try {
    const { ids, content } = req.body;

    if (!content) {
      console.log("No Content Here")
    }

    if (ids && ids.length > 0) {
      await userAdminModel.updateMany(
        // { _id: { $in: ids } },  
        { _id: ids },
        { $push: { content: { $each: content } } }
      );
    } else {
      await userAdminModel.updateMany(
        { role: 'user' },
        { $push: { content: { $each: content } } }
      );
    }

    res.status(200).json({
      message: "Content shared with all users",
      success: true,
      // data: savedContent
    });

  } catch (error) {
    console.log(error);
  }
}


export const taskDuration = async (req, res) => {
  try {
    const { task, userId } = req.body;

    if (!task || !task.taskId || !userId) {
      return res.status(400).json({ message: "Invalid task or user data" });
    }

    if (!task.startTime || !task.endTime) {
      return res.status(400).json({ message: "Start time or end time missing" });
    }

    const user = await userAdminModel.findOne({
      _id: userId,
      "content._id": task.taskId,
    });

    if (!user) {
      return res.status(404).json({ message: "User or task not found" });
    }

    const startTime = new Date(task.startTime);
    const endTime = new Date(task.endTime);
    const totalMilliseconds = endTime - startTime;

    if (totalMilliseconds <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const formattedTime = `${days}d ${hours}h ${minutes}m`;



    const updatedTask = await userAdminModel.findOneAndUpdate(
      { _id: userId, "content._id": task.taskId },
      {
        $set: {
          "content.$.startTime": task.startTime,
          "content.$.endTime": task.endTime,
          "content.$.totalTime": formattedTime,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(500).json({ message: "Failed to update task" });
    }

    res.status(200).json({
      message: "Task duration updated successfully",
      success: true,
      data: formattedTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




export const showTask = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      console.log("No Content Here")
    }

    const savedContent = await userAdminModel.find(
      { role: 'user' },
      { _id: 0, content: 1, fullname: 1 }
    )

    res.status(200).json({
      message: "Content Retrive Successfully",
      success: true,
      savedTask: savedContent
    });

  } catch (error) {
    console.log(error);
  }
}


export const documentDownloadPdf = async (req, res) => {
  const users = req.body.userInfo;

  try {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=users.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("User Details", { align: "center" }).moveDown(2);

    const startX = 50;
    const startY = 100;
    const columnWidths = [40, 120, 150, 80, 70, 70];
    const rowHeight = 30;
    const pageHeight = doc.page.height - 50;
    const headers = ["S.No", "Name", "Email", "City", "Country", "Role"];

    let y = startY;
    let x = startX;

    const drawTableHeader = () => {
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, columnWidths[i], rowHeight).stroke();
        doc.font("Helvetica-Bold").fontSize(10).text(header, x, y + 8, { width: columnWidths[i] - 10, align: "center", });
        x += columnWidths[i];
      });
    };

    drawTableHeader();

    users.forEach((user, index) => {
      y += rowHeight;

      if (y + rowHeight > pageHeight) {
        doc.addPage();
        y = startY;
        drawTableHeader();
        y += rowHeight;
      }

      x = startX;

      const rowData = [
        index + 1, // S.No
        user.fullname,
        user.email,
        user.city,
        user.country,
        user.role,
      ];

      rowData.forEach((data, i) => {
        doc.rect(x, y, columnWidths[i], rowHeight).stroke();
        doc.font("Helvetica").fontSize(10).text(data.toString(), x, y + 8, { width: columnWidths[i] - 10, align: "center", continued: false, });
        x += columnWidths[i];
      });
    });

    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to generate PDF." });
  }
};


export const documentDownloadCsv = async (req, res) => {
  const users = req.body.userInfo;
  try {
    const excludeFields = ["password", "__v"];

    const filteredUsers = users.map((user) => {
      const newUser = {};
      for (let key in user) {
        if (!excludeFields.includes(key)) {
          newUser[key] = user[key];
        }
      }
      return newUser;
    });


    const csv = parse(filteredUsers);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");

    res.send(csv);
  } catch (error) {
    console.log(error);
  }
};





// $match ka kaam documents ko filter karna hai jo user ki query ke saath match karein.
// $or ka matlab hai ki name ya city dono mein se koi ek match karna chahiye.
// $regex ka use pattern-matching ke liye kiya ja raha hai, jo text-based search karta hai.
// $options: "i" ka matlab hai ki search case-insensitive hai, uppercase ya lowercase ka farak nahi padta.
