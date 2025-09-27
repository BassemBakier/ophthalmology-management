@echo off
echo ========================================
echo   Ophthalmology Management System
echo   GitHub Deployment Script
echo ========================================
echo.

echo Step 1: Creating GitHub repository...
echo Please go to https://github.com/new and create a repository named 'ophthalmology-management'
echo Make sure to choose PUBLIC and DO NOT initialize with README
echo.
pause

echo Step 2: Please enter your GitHub username:
set /p username=GitHub Username: 

echo.
echo Step 3: Adding remote origin...
git remote add origin https://github.com/%username%/ophthalmology-management.git

echo.
echo Step 4: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your website will be available at:
echo https://%username%.github.io/ophthalmology-management
echo.
echo Next steps:
echo 1. Go to Settings ^> Pages in your GitHub repository
echo 2. Choose "GitHub Actions" as source
echo 3. Update Supabase settings in script.js
echo 4. Run database-setup.sql in Supabase
echo.
pause
