"use client";
import { useEffect, useState, FormEvent, useRef} from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departments, setDepartments] = useState<Schema["Department"]["type"][]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [users, setUsers] = useState<Schema["User"]["type"][]>([]);


  useEffect(() => {
    // Fetch Departments (for dropdown)
    const fetchDepartments = async () => {
      const result = await client.models.Department.list();
      setDepartments(result.data);
      console.log("Departments:", result.data);
    };
    fetchDepartments();
  }, []);


    useEffect(() => {
    // Fetch Departments (for dropdown)
    const fetchDepartments = async () => {
      const result = await client.models.User.list();
      // setDepartments(result.data);
      console.log("Users:", result.data);
    };
    fetchDepartments();
  }, []);
  // const hasInitialized = useRef(false); // track initialization

  // useEffect(() => {
  //   // Prevent running more than once (even during hot reloads)
  //   if (hasInitialized.current) return;
  //   hasInitialized.current = true;

  //   const departmentList = ['ECE', 'CSE', 'IT', 'MECH', 'CIVIL'];

  //   const createDepartments = async () => {
  //     try {
  //       for (const dept of departmentList) {
  //         const result = await client.models.Department.create({
  //           name: dept,
  //         });
  //         console.log("Created Department:", result.data);
  //       }
  //     } catch (error) {
  //       console.error("Error creating departments:", error);
  //     }
  //   };

  //   createDepartments();
  // }, []);
useEffect(() => {
    const fetchData = async () => {
      // Fetch all users and departments
      const userResult = await client.models.User.list();
      setUsers(userResult.data);
      const deptResult = await client.models.Department.list();

      setDepartments(deptResult.data);
    };

    fetchData();
  }, []);

const getDepartmentName = (deptId: string): string => {
  if (!deptId) return "Not Assigned";

  const match = departments.find((d) => d.id === deptId);

  return match?.name ?? `Unknown (${deptId})`; // ensures it's always a string
};

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const result = await client.models.User.create({
      name,
      email,
      departmentID: selectedDept,
    });

    alert("User registered successfully!");

    // ✅ Use result.data to update the local users list
    setUsers((prev) => result.data ? [...prev, result.data] : prev);

    // Reset form fields
    setName("");
    setEmail("");
    setSelectedDept("");
  } catch (error) {
    console.error("Error creating user:", error);
    alert("Failed to register user.");
  }
};



  // const handleRegister = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedDept) return alert("Please select a department");

  //   try {
  //     await client.models.User.create({
  //       name,
  //       email,
  //       departmentID: selectedDept, // Foreign key
  //     });
  //     alert("User registered successfully!");
  //       // Add to the list immediately
  //     setUsers((prev) => [...prev, result.data]);
  //     setName("");
  //     setEmail("");
  //     setSelectedDept("");
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };



  return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-8">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">Register</h2>

        <input
          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <select
          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>

      {/* Table displaying all registered users */}
      {users.length > 0 && (
        <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Registered Users</h3>
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border text-black">Name</th>
                <th className="px-4 py-2 border text-black">Email</th>
                <th className="px-4 py-2 border text-black">Department</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id || user.email}>
                  <td className="px-4 py-2 border text-black">{user.name}</td>
                  <td className="px-4 py-2 border text-black">{user.email}</td>
                  <td className="px-4 py-2 border text-black">
  {user.departmentID ? getDepartmentName(user.departmentID) : "N/A"}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
