Best Suggestion: Use VS Code Integrated Terminals (Cleaner & Easier)

Instead of opening three separate external windows, you can manage them all inside VS Code without cluttering your desktop:

Open your project folder d:\FINAL YEAR PROJECT in VS Code.

Press Ctrl + ~ (Ctrl + Backtick) to open the built-in terminal.

Click the + icon (or dropdown) in the top-right of the terminal panel to open three separate terminals (tabs).

Rename each tab so they are easy to monitor:

Tab 1: MongoDB -> & "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\FINAL YEAR PROJECT\mongodb_data" --port 27017
OR
Tab 1: MongoDB -> & "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "d:\FINAL YEAR PROJECT\mongodb_data" --port 27017 --bind_ip 127.0.0.1

Tab 2: Backend -> cd server then npm run dev

Tab 3: Frontend -> cd client then npm run dev