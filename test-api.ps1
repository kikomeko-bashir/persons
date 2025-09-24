# API Testing Script for Persons Authentication Backend
# This script tests all authentication endpoints

Write-Host "🧪 Testing Persons Authentication API" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3002/health" -Method GET
    Write-Host "✅ Health Check: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: User Registration
Write-Host "`n2. Testing User Registration..." -ForegroundColor Yellow
try {
    $registerData = @{
        username = "testuser123"
        email = "test@example.com"
        password = "password123"
        confirmPassword = "password123"
    } | ConvertTo-Json

    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3002/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration: $($registerResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($registerResponse.Content)" -ForegroundColor Cyan
    
    # Extract token for next tests
    $registerResult = $registerResponse.Content | ConvertFrom-Json
    $token = $registerResult.token
    Write-Host "Token: $token" -ForegroundColor Magenta
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

# Test 3: User Login
Write-Host "`n3. Testing User Login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3002/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($loginResponse.Content)" -ForegroundColor Cyan
    
    # Extract token if not already available
    if (-not $token) {
        $loginResult = $loginResponse.Content | ConvertFrom-Json
        $token = $loginResult.token
        Write-Host "Token: $token" -ForegroundColor Magenta
    }
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Current User (requires token)
Write-Host "`n4. Testing Get Current User..." -ForegroundColor Yellow
if ($token) {
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $meResponse = Invoke-WebRequest -Uri "http://localhost:3002/auth/me" -Method GET -Headers $headers
        Write-Host "✅ Get Current User: $($meResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($meResponse.Content)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Get Current User Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping Get Current User - No token available" -ForegroundColor Yellow
}

# Test 5: User Logout (requires token)
Write-Host "`n5. Testing User Logout..." -ForegroundColor Yellow
if ($token) {
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $logoutResponse = Invoke-WebRequest -Uri "http://localhost:3002/auth/logout" -Method POST -Headers $headers
        Write-Host "✅ Logout: $($logoutResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($logoutResponse.Content)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Logout Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping Logout - No token available" -ForegroundColor Yellow
}

# Test 6: Test with existing demo user
Write-Host "`n6. Testing Login with Demo User..." -ForegroundColor Yellow
try {
    $demoLoginData = @{
        email = "demo@example.com"
        password = "password123"
    } | ConvertTo-Json

    $demoLoginResponse = Invoke-WebRequest -Uri "http://localhost:3002/auth/login" -Method POST -Body $demoLoginData -ContentType "application/json"
    Write-Host "✅ Demo Login: $($demoLoginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($demoLoginResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Demo Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
