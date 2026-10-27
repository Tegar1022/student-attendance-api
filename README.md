# Student Attendance REST API

A modular RESTful API built with **Node.js**, **Express.js**, and **SQLite** for managing student records and daily attendance.

## Features

- **Student Management**: Create, read, and delete student data.
- **Attendance Tracking**: Record daily student attendance status (`HADIR`, `IZIN`, `SAKIT`, `ALFA`).
- **Relational Reports**: Combined attendance report using SQL `JOIN`.
- **Database Cascading**: Automatic deletion of attendance records when a student is deleted (`ON DELETE CASCADE`).

## Tech Stack

- Node.js
- Express.js
- SQLite3

## Project Structure

```text
student-attendance-api/
├── config/
│   └── database.js
├── controllers/
│   ├── attendanceController.js
│   └── studentController.js
├── routes/
│   ├── attendanceRoutes.js
│   └── studentRoutes.js
├── .gitignore
├── package.json
├── README.md
└── server.js