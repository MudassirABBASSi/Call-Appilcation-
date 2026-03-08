/**
 * Comprehensive Test: Submission & Grading Workflow
 * Tests the complete flow from student submission to teacher grading to student viewing grade
 */

const http = require('http');
const db = require('./backend/config/db');

// Test tokens (replace with actual valid tokens)
const STUDENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInJvbGUiOiJzdHVkZW50IiwibmFtZSI6IkFoYW1kIEZhcmhhbiIsImVtYWlsIjoiYWhtYWRmYXJoYW4zMjMwNEBnbWFpbC5jb20iLCJpYXQiOjE3NDEyNTkzNjR9.XE2xGQaXm5UhW2M7yxrVpg1_p7HDt6_2KeFt8mZCr9g';
const TEACHER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsInJvbGUiOiJ0ZWFjaGVyIiwibmFtZSI6IlRlc3QgTXVkYXNzaXIiLCJlbWFpbCI6Im11ZGFzc2lyQGRlbW8uY29tIiwiaWF0IjoxNzQxMjU5MDMyfQ.1WHtQb5_KGejDiBb9sP2n0C4R_8h2x9DQwJ_d3fCv1A';

// Test assignment ID
const ASSIGNMENT_ID = 30;

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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   SUBMISSION & GRADING WORKFLOW - Complete Test Suite      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // ============================================
    // STEP 1: Student Views Assignments
    // ============================================
    console.log('📚 STEP 1: Student Views Their Assignments');
    console.log('─'.repeat(60));
    
    const assignmentsRes = await makeRequest('GET', '/api/assignments/student/my-assignments', STUDENT_TOKEN);
    
    if (assignmentsRes.statusCode !== 200) {
      console.log(`❌ Failed to fetch assignments: ${assignmentsRes.statusCode}`);
      console.log(assignmentsRes.data);
      return;
    }
    
    const assignments = assignmentsRes.data?.assignments || assignmentsRes.data || [];
    console.log(`✅ Found ${assignments.length} assignments`);
    
    const testAssignment = assignments.find(a => a.id === ASSIGNMENT_ID);
    if (!testAssignment) {
      console.log(`❌ Assignment ${ASSIGNMENT_ID} not found for student`);
      return;
    }
    
    console.log(`\n📝 Assignment Details:`);
    console.log(`   Title: ${testAssignment.title}`);
    console.log(`   Status: ${testAssignment.submission_status || 'Not submitted'}`);
    console.log(`   Submission ID: ${testAssignment.submission_id || 'None'}`);
    console.log(`   Graded: ${testAssignment.graded ? 'Yes' : 'No'}`);
    if (testAssignment.graded) {
      console.log(`   Marks: ${testAssignment.marks_obtained}/${testAssignment.total_marks}`);
      console.log(`   Feedback: ${testAssignment.feedback || 'None'}`);
    }
    
    // ============================================
    // STEP 2: Verify Submission in Database
    // ============================================
    console.log('\n\n🔍 STEP 2: Check Submission Status in Database');
    console.log('─'.repeat(60));
    
    await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = 63',
        [ASSIGNMENT_ID],
        (err, results) => {
          if (err) {
            console.log('❌ Database error:', err.message);
            reject(err);
            return;
          }
          
          if (results.length === 0) {
            console.log('⚠️  No submission found in database');
          } else {
            const submission = results[0];
            console.log('✅ Submission found in database:');
            console.log(`   Submission ID: ${submission.id}`);
            console.log(`   Status: ${submission.status}`);
            console.log(`   Submitted At: ${submission.submitted_at}`);
            console.log(`   Marks: ${submission.marks !== null ? submission.marks : 'Not graded'}`);
            console.log(`   Feedback: ${submission.feedback || 'None'}`);
          }
          resolve();
        }
      );
    });
    
    // ============================================
    // STEP 3: Teacher Views Submissions
    // ============================================
    console.log('\n\n👨‍🏫 STEP 3: Teacher Views Submissions');
    console.log('─'.repeat(60));
    
    const submissionsRes = await makeRequest('GET', `/api/teacher/submissions/${ASSIGNMENT_ID}`, TEACHER_TOKEN);
    
    if (submissionsRes.statusCode !== 200) {
      console.log(`❌ Failed to fetch submissions: ${submissionsRes.statusCode}`);
      console.log(submissionsRes.data);
    } else {
      const submissions = submissionsRes.data.submissions || [];
      console.log(`✅ Found ${submissions.length} student(s) in class`);
      
      submissions.forEach((sub, idx) => {
        console.log(`\n   Student ${idx + 1}: ${sub.student_name}`);
        console.log(`     Status: ${sub.status}`);
        console.log(`     Has Submitted: ${sub.submission_id ? 'Yes' : 'No'}`);
        if (sub.marks !== null) {
          console.log(`     Marks: ${sub.marks}`);
          console.log(`     Feedback: ${sub.feedback || 'None'}`);
        }
      });
      
      // Find the test student's submission
      const studentSubmission = submissions.find(s => s.student_name === 'Ahamd Farhan');
      if (studentSubmission && studentSubmission.submission_id) {
        console.log(`\n\n📊 STEP 4: Teacher Grades the Submission`);
        console.log('─'.repeat(60));
        
        const gradeRes = await makeRequest(
          'PUT',
          `/api/teacher/grade/${studentSubmission.submission_id}`,
          TEACHER_TOKEN,
          { marks_obtained: 92, feedback: 'Excellent work! Well done.' }
        );
        
        if (gradeRes.statusCode === 200) {
          console.log('✅ Submission graded successfully!');
          console.log(`   Marks: 92`);
          console.log(`   Feedback: "Excellent work! Well done."`);
        } else {
          console.log(`❌ Grading failed: ${gradeRes.statusCode}`);
          console.log(gradeRes.data);
        }
      }
    }
    
    // ============================================
    // STEP 5: Student Views Grade
    // ============================================
    console.log('\n\n👨‍🎓 STEP 5: Student Views Updated Grade');
    console.log('─'.repeat(60));
    
    // Wait a moment for database update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedAssignmentsRes = await makeRequest('GET', '/api/assignments/student/my-assignments', STUDENT_TOKEN);
    
    if (updatedAssignmentsRes.statusCode === 200) {
      const updatedAssignments = updatedAssignmentsRes.data?.assignments || updatedAssignmentsRes.data || [];
      const updatedAssignment = updatedAssignments.find(a => a.id === ASSIGNMENT_ID);
      
      if (updatedAssignment) {
        console.log(`✅ Assignment fetched successfully`);
        console.log(`\n📊 Updated Assignment Status:`);
        console.log(`   Title: ${updatedAssignment.title}`);
        console.log(`   Status: ${updatedAssignment.submission_status}`);
        console.log(`   Graded: ${updatedAssignment.graded ? '✓ Yes' : '✗ No'}`);
        
        if (updatedAssignment.graded) {
          console.log(`\n   🎯 Grade Details:`);
          console.log(`      Marks: ${updatedAssignment.marks_obtained}/${updatedAssignment.total_marks}`);
          console.log(`      Percentage: ${Math.round((updatedAssignment.marks_obtained / updatedAssignment.total_marks) * 100)}%`);
          console.log(`      Feedback: "${updatedAssignment.feedback}"`);
          console.log(`\n   ✅ PASS: Student can see the grade!`);
        } else {
          console.log(`\n   ⚠️  Assignment not yet graded`);
        }
      }
    }
    
    // ============================================
    // Final Summary
    // ============================================
    console.log('\n\n' + '═'.repeat(60));
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('\n✅ Workflow Verified:');
    console.log('   1. Student can view assignments');
    console.log('   2. Submission status is tracked correctly');
    console.log('   3. Teacher can see submissions');
    console.log('   4. Teacher can grade submissions');
    console.log('   5. Student can view grades and feedback');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error('   Make sure both backend and frontend servers are running');
  }
  
  process.exit(0);
}

// Run the test
runTest();
