"use client";
import { useEffect, useState, FormEvent } from "react";
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

  useEffect(() => {
    // Fetch Departments (for dropdown)
    const fetchDepartments = async () => {
      const result = await client.models.Department.list();
      setDepartments(result.data);
    };
    fetchDepartments();
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return alert("Please select a department");

    try {
      await client.models.User.create({
        name,
        email,
        departmentID: selectedDept, // Foreign key
      });
      alert("User registered successfully!");
      setName("");
      setEmail("");
      setSelectedDept("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
       <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
    </div>
  );
}
