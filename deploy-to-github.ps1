# Ophthalmology Management System - GitHub Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Ophthalmology Management System" -ForegroundColor Cyan
Write-Host "   GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Creating GitHub repository..." -ForegroundColor Yellow
Write-Host "Please go to https://github.com/new and create a repository named 'ophthalmology-management'" -ForegroundColor White
Write-Host "Make sure to choose PUBLIC and DO NOT initialize with README" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter after creating the repository"

Write-Host ""
Write-Host "Step 2: Please enter your GitHub username:" -ForegroundColor Yellow
$username = Read-Host "GitHub Username"

Write-Host ""
Write-Host "Step 3: Adding remote origin..." -ForegroundColor Green
git remote add origin "https://github.com/$username/ophthalmology-management.git"

Write-Host ""
Write-Host "Step 4: Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your website will be available at:" -ForegroundColor Green
Write-Host "https://$username.github.io/ophthalmology-management" -ForegroundColor Magenta
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Settings > Pages in your GitHub repository" -ForegroundColor White
Write-Host "2. Choose 'GitHub Actions' as source" -ForegroundColor White
Write-Host "3. Update Supabase settings in script.js" -ForegroundColor White
Write-Host "4. Run database-setup.sql in Supabase" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
