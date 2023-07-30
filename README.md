# 🏢 Tauri Room Manager
Rust-based desktop application powered by Tauri, designed to efficiently manage bookings for rooms, providing a comprehensive solution for room management.

# 📷 Preview
![](https://github.com/pathetic/tauri-room-manager/blob/main/preview.gif)

# 📃 Current Features
- Encrypted database
    > Currently using SurrealDB
- Calendar View
    > View all your reservations in a Calendar
- Table View
    > View all your reservations in a Table  
    > Create/Update/Delete reservations with ease
- Availability Verification
    > Check which rooms are available within a specified timeframe

# 🔧 Setup
- Make sure you have the last version of rust and nodejs installed.
- Install the dependencies.
```
npm i
```

# 📋 Running it
- To run in development mode:
```
npm run tauri dev
```
- To compile it (in release mode):
```
npm run tauri build
```

# 🚧 To-Do
- Save the database automatically (currently you have to manually save it with a button)
  > when the database gets created (first run of the program)  
  > when the user makes any changes
