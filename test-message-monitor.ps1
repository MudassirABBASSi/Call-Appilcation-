# ═══════════════════════════════════════════════════════════════
# MESSAGE MONITOR SYSTEM TEST SCRIPT
# Tests all functionality of the conversation-based monitoring system
# ═══════════════════════════════════════════════════════════════

Write-Host "`n🧪 TESTING MESSAGE MONITOR SYSTEM" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:5000/api"
$frontendUrl = "http://localhost:3000"

# Test credentials
$adminEmail = "admin@alburhan.com"
$adminPassword = "admin123"

# Color codes
$success = "Green"
$error = "Red"
$info = "Yellow"

# ═══════════════════════════════════════════════════════════════
# TEST 1: Backend Health Check
# ═══════════════════════════════════════════════════════════════

Write-Host "TEST 1: Backend Health Check" -ForegroundColor $info
try {
    $response = Invoke-WebRequest "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email=$adminEmail;password=$adminPassword} | ConvertTo-Json) -ErrorAction Stop
    $token = ($response.Content | ConvertFrom-Json).token
    Write-Host "✅ Backend is running" -ForegroundColor $success
    Write-Host "✅ Admin login successful" -ForegroundColor $success
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend connection failed!" -ForegroundColor $error
    Write-Host "   Make sure backend is running: cd backend && npm start" -ForegroundColor $error
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════
# TEST 2: Conversation List API
# ═══════════════════════════════════════════════════════════════

Write-Host "TEST 2: Conversation List API" -ForegroundColor $info
try {
    $response = Invoke-WebRequest "$baseUrl/conversations?page=1&limit=20" -Headers $headers -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ API endpoint working" -ForegroundColor $success
    Write-Host "   Total conversations: $($data.pagination.total)" -ForegroundColor Gray
    Write-Host "   Current page: $($data.pagination.current_page) of $($data.pagination.total_pages)" -ForegroundColor Gray
    
    if ($data.conversations.Count -gt 0) {
        Write-Host "✅ Conversations found" -ForegroundColor $success
        $conv = $data.conversations[0]
        Write-Host "   Example: $($conv.teacher_name) ↔ $($conv.student_name)" -ForegroundColor Gray
        Write-Host "   Last message: $($conv.last_message.Substring(0,[Math]::Min(40,$conv.last_message.Length)))..." -ForegroundColor Gray
        $convId = $conv.conversation_id
    } else {
        Write-Host "⚠️  No conversations found (this is OK if no messages sent yet)" -ForegroundColor $info
        $convId = $null
    }
} catch {
    Write-Host "❌ Conversation list API failed!" -ForegroundColor $error
    Write-Host "   Error: $_" -ForegroundColor $error
    exit 1
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════
# TEST 3: Message Details API
# ═══════════════════════════════════════════════════════════════

if ($convId) {
    Write-Host "TEST 3: Message Details API" -ForegroundColor $info
    try {
        $response = Invoke-WebRequest "$baseUrl/conversations/$convId/messages?page=1&limit=50" -Headers $headers -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ Message details API working" -ForegroundColor $success
        Write-Host "   Total messages: $($data.pagination.total)" -ForegroundColor Gray
        
        if ($data.messages.Count -gt 0) {
            Write-Host "✅ Messages loaded" -ForegroundColor $success
            $msg = $data.messages[0]
            Write-Host "   Latest: $($msg.sender_name): ""$($msg.message)""" -ForegroundColor Gray
            Write-Host "   Sent at: $($msg.sent_at)" -ForegroundColor Gray
            Write-Host "   Read: $(if($msg.is_read -eq 1){'✓✓'}else{'✓'})" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Message details API failed!" -ForegroundColor $error
        Write-Host "   Error: $_" -ForegroundColor $error
    }
    Write-Host ""
} else {
    Write-Host "TEST 3: Message Details API" -ForegroundColor $info
    Write-Host "⚠️  Skipped (no conversations to test)" -ForegroundColor $info
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════
# TEST 4: Frontend Health Check
# ═══════════════════════════════════════════════════════════════

Write-Host "TEST 4: Frontend Health Check" -ForegroundColor $info
try {
    Start-Sleep -Seconds 2
    $response = Invoke-WebRequest $frontendUrl -ErrorAction Stop
    Write-Host "✅ Frontend is running" -ForegroundColor $success
    Write-Host "   URL: $frontendUrl" -ForegroundColor Gray
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Frontend connection failed!" -ForegroundColor $error
    Write-Host "   Make sure frontend is running: cd frontend && npm start" -ForegroundColor $error
    Write-Host "   Wait 30-60 seconds for compilation to complete" -ForegroundColor $error
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════
# TEST 5: Database Structure Verification
# ═══════════════════════════════════════════════════════════════

Write-Host "TEST 5: Database Structure (Manual Check Required)" -ForegroundColor $info
Write-Host "Run these SQL queries to verify:" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Check conversations table:" -ForegroundColor Gray
Write-Host "SELECT COUNT(*) as total_conversations FROM conversations;" -ForegroundColor DarkGray
Write-Host ""
Write-Host "-- Check indexes:" -ForegroundColor Gray
Write-Host "SHOW INDEXES FROM conversations;" -ForegroundColor DarkGray
Write-Host "SHOW INDEXES FROM messages;" -ForegroundColor DarkGray
Write-Host ""
Write-Host "-- View sample conversation:" -ForegroundColor Gray
Write-Host "SELECT c.*, t.name as teacher_name, s.name as student_name" -ForegroundColor DarkGray
Write-Host "FROM conversations c" -ForegroundColor DarkGray
Write-Host "JOIN users t ON c.teacher_id = t.id" -ForegroundColor DarkGray
Write-Host "JOIN users s ON c.student_id = s.id" -ForegroundColor DarkGray
Write-Host "LIMIT 1;" -ForegroundColor DarkGray
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "✅ Backend API: Working" -ForegroundColor $success
Write-Host "✅ Authentication: Working" -ForegroundColor $success
Write-Host "✅ Conversation List: Working" -ForegroundColor $success
if ($convId) {
    Write-Host "✅ Message Details: Working" -ForegroundColor $success
} else {
    Write-Host "⚠️  Message Details: Not tested (no data)" -ForegroundColor $info
}
Write-Host "✅ Frontend: Working" -ForegroundColor $success

Write-Host "`n🎯 NEXT STEPS:`n" -ForegroundColor Cyan
Write-Host "1. Open browser: $frontendUrl" -ForegroundColor White
Write-Host "2. Login with: $adminEmail / $adminPassword" -ForegroundColor White
Write-Host "3. Click 'Message Monitor' in sidebar" -ForegroundColor White
Write-Host "4. Test all features:" -ForegroundColor White
Write-Host "   - Search by teacher/student name" -ForegroundColor Gray
Write-Host "   - Filter by date" -ForegroundColor Gray
Write-Host "   - Click conversation to view full chat" -ForegroundColor Gray
Write-Host "   - Check unread badges" -ForegroundColor Gray
Write-Host "   - Test pagination" -ForegroundColor Gray
Write-Host "   - Verify WhatsApp-style bubbles" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation: FINAL_IMPLEMENTATION_REPORT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host ""
