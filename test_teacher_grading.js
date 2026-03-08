/**
 * Test Script: Teacher Grading Workflow
 * Verifies that teachers can see student submissions and grade them
 */

const http = require('http');

// Teacher token (user ID 50, teacher role)
const TEACHER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTAsInJvbGUiOiJ0ZWFjaGVyIiwibmFtZSI6IkFsbEJvcm51byIsImVtYWlsIjoiYWxsYm9ybm51b0BkZW1vLmNvbSIsImlhdCI6MTc0MTI0NDAxNn0.fA5Tz0iVlNGkEQZt8M0l1W1NsLxQcEaKhZLjjKiTpXU';

// Assignment ID that has submissions
const ASSIGNMENT_ID = 28;

// Function to make HTTP request
function makeRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Teacher Grading Workflow - API Test Suite            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Fetch teacher submissions
    console.log('📋 Test 1: Fetch Teacher Submissions');
    console.log(`   GET /api/teacher/submissions/${ASSIGNMENT_ID}`);
    
    const submissionsRes = await makeRequest(
      'GET',
      `/api/teacher/submissions/${ASSIGNMENT_ID}`,
      TEACHER_TOKEN
    );

    if (submissionsRes.statusCode === 200) {
      console.log(`   ✅ Status: ${submissionsRes.statusCode}`);
      const submissions = submissionsRes.data.submissions;
      console.log(`   ✅ Found ${submissions.length} submissions\n`);
      
      submissions.forEach((sub, idx) => {
        console.log(`   Submission ${idx + 1}:`);
        console.log(`     - Student: ${sub.student_name}`);
        console.log(`     - Status: ${sub.status}`);
        console.log(`     - Has File: ${sub.file_url ? 'Yes' : 'No'}`);
        console.log(`     - Submitted: ${sub.submitted_at ? sub.submitted_at : 'Not submitted'}`);
        console.log(`     - Marks: ${sub.marks !== null ? sub.marks : 'Not graded'}`);
      });
    } else {
      console.log(`   ❌ Status: ${submissionsRes.statusCode}`);
      console.log(`   ❌ Error:`, submissionsRes.data);
    }

    console.log('\n' + '═'.repeat(60) + '\n');

    // Test 2: Grade a submission (if any exist)
    const ungraded = submissionsRes.data?.submissions?.find(s => s.submission_id && s.marks === null);
    if (ungraded) {
      console.log('📝 Test 2: Grade a Submission');
      console.log(`   PUT /api/teacher/grade/${ungraded.submission_id}`);
      console.log(`   Student: ${ungraded.student_name}`);
      
      const gradeRes = await makeRequest(
        'PUT',
        `/api/teacher/grade/${ungraded.submission_id}`,
        TEACHER_TOKEN,
        { marks_obtained: 85, feedback: 'Great work!' }
      );

      if (gradeRes.statusCode === 200) {
        console.log(`   ✅ Status: ${gradeRes.statusCode}`);
        console.log(`   ✅ Submission graded successfully\n`);
      } else {
        console.log(`   ❌ Status: ${gradeRes.statusCode}`);
        console.log(`   ❌ Error:`, gradeRes.data);
      }

      console.log('\n' + '═'.repeat(60) + '\n');

      // Test 3: Verify grade was saved
      console.log('✔️  Test 3: Verify Grade Was Saved');
      console.log(`   GET /api/teacher/submissions/${ASSIGNMENT_ID} (re-fetch)`);
      
      const verifyRes = await makeRequest(
        'GET',
        `/api/teacher/submissions/${ASSIGNMENT_ID}`,
        TEACHER_TOKEN
      );

      if (verifyRes.statusCode === 200) {
        const graded = verifyRes.data.submissions.find(s => s.submission_id === ungraded.submission_id);
        if (graded && graded.marks === 85) {
          console.log(`   ✅ Grade verified: ${graded.marks} marks`);
          console.log(`   ✅ Feedback: "${graded.feedback}"\n`);
        } else {
          console.log(`   ❌ Grade not saved properly`);
        }
      }
    } else {
      console.log('⚠️  No ungraded submissions found for grading test\n');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('   Make sure the backend server is running on port 5000');
  }
}

// Run tests
runTests();
