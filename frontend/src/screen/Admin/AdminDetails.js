import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminDetails = () => {
  const [adminDetail, setadminDetail] = useState({});

  const getDetails = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/user/userData",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", 
        }
      );

      if (!response.ok) {
        console.log("Failed to fetch data");
        return;
      }

      const responseData = await response.json();

      if (responseData.success) {
        setadminDetail({
          fullname: responseData.user.fullname,
          email: responseData.user.email,
          address: responseData.user.address,
          phoneNumber: responseData.user.phoneNumber,
          city: responseData.user.city,
          country: responseData.user.country,
          role: responseData.user.role,
          image: responseData.user.image || "default-photo-url.jpg", // Fallback for photo
        });
      } else {
        console.log("Unable to fetch user data");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getDetails();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="md:w-1/3 flex flex-col items-center bg-white p-6 shadow-sm rounded-l-lg mt-12">
          <div className="relative mb-4">
            <img
              src={adminDetail.image || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-md"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {adminDetail.fullname}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{adminDetail.role}</p>
        </div>

        <div className="md:w-2/3 p-6 bg-gray-50">
          <div className="flex justify-end mb-4">
            <Link
              to="/admin/updateAdminProfile"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-700 transition"
            >
              Edit Profile
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
              <span className="text-gray-600 font-medium w-1/3">Email:</span>
              <span className="text-gray-800 w-2/3">{adminDetail.email}</span>
            </div>
            <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
              <span className="text-gray-600 font-medium w-1/3">Address:</span>
              <span className="text-gray-800 w-2/3">{adminDetail.address}</span>
            </div>
            <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
              <span className="text-gray-600 font-medium w-1/3">City:</span>
              <span className="text-gray-800 w-2/3">{adminDetail.city}</span>
            </div>
            <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
              <span className="text-gray-600 font-medium w-1/3">Country:</span>
              <span className="text-gray-800 w-2/3">{adminDetail.country}</span>
            </div>
            <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
              <span className="text-gray-600 font-medium w-1/3">Phone:</span>
              <span className="text-gray-800 w-2/3">
                +91 {adminDetail.phoneNumber}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;