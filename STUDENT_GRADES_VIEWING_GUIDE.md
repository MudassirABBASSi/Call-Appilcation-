# 📚 How Students Review Their Grades & Feedback

## 🎯 Step-by-Step Guide for Students

### **Step 1: Login to Dashboard**
1. Open **http://localhost:3000**
2. Login with your student credentials
   - Example: `ali@demo.com` / `student123`
3. You'll see **Student Dashboard**

---

### **Step 2: Go to "My Assignments"**
1. From the student dashboard, click **"My Assignments"** in the navigation
2. Alternative route: `/student/assignments`

---

### **Step 3: View Your Assignments**
You'll see a table with all your assignments from enrolled classes:

| Title | Course | Due Date | Status | Grade | Actions |
|-------|--------|----------|--------|-------|---------|
| Algebra Quiz | Math 101 | Mar 15, 2026 | ✓ Submitted | 85/100 | **View Feedback** |
| Essay | English | Mar 20, 2026 | ✓ Submitted | 92/100 | **View Feedback** |
| Lab Report | Science | Mar 22, 2026 | ⏳ Not Submitted | - | Choose File |

---

### **Step 4: Check Your Grade Status**

#### **If Assignment is NOT YET Graded:**
- **Status**: `✓ Submitted` 
- **Grade Column**: Shows `Pending`
- **Action**: Shows `✓ Awaiting Grading`
- Message: Your teacher is still reviewing your work

#### **If Assignment IS Graded:**
- **Status**: `✓ Submitted`
- **Grade Column**: Shows `85/100` (marks/total)
- **Action**: Shows `View Feedback` button (blue button)

#### **If You Haven't Submitted:**
- **Status**: `⏳ Not Submitted`
- **Grade Column**: Shows `-`
- **Action**: File upload section to submit

---

### **Step 5: View Teacher's Feedback & Marks**

#### **Option A: From Table (Quick View)**
```
Grade Column displays:
┌──────────────────┐
│    85/100        │  ← Your score
│   (85%)          │  ← Your percentage
└──────────────────┘
```

#### **Option B: Full Details (Click "View Feedback")**
1. Click the blue **"View Feedback"** button
2. A detailed modal opens showing:

```
┌─────────────────────────────────────────┐
│      ASSIGNMENT FEEDBACK MODAL          │
├─────────────────────────────────────────┤
│ Assignment Title: Algebra Quiz          │
│ Course: Mathematics 101                 │
│ Submitted On: Jan 15, 2026 2:30 PM      │
├─────────────────────────────────────────┤
│                                         │
│  YOUR GRADE:                            │
│  ┌───────────────────────────────────┐  │
│  │         85/100 (85%)              │  │
│  └───────────────────────────────────┘  │
│  (Purple gradient background)           │
│                                         │
├─────────────────────────────────────────┤
│ TEACHER'S FEEDBACK:                     │
│ ┌─────────────────────────────────────┐ │
│ │ Great work! Your calculations are   │ │
│ │ mostly correct. Just remember to    │ │
│ │ show your steps more clearly        │ │
│ │ next time. Well done! 👍             │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ YOUR SUBMISSION:                        │
│ 📄 Download Submitted File              │
│ (Click to download your work)           │
│                                         │
│           [Close]                       │
└─────────────────────────────────────────┘
```

---

## 📊 **Understanding Your Grade Display**

### **Grade Components:**

| Part | Meaning | Example |
|------|---------|---------|
| **First Number** | Your mark | `85` |
| **Second Number** | Total marks possible | `100` |
| **Percentage** | Your score percentage | `85%` |

### **Grade Color Indicators:**

| Grade Range | Color | Meaning |
|-------------|-------|---------|
| **90-100%** | 🟢 Green | Excellent! |
| **80-89%** | 🔵 Blue | Very Good! |
| **70-79%** | 🟡 Yellow | Good Work! |
| **60-69%** | 🟠 Orange | Satisfactory |
| **Below 60%** | 🔴 Red | Needs Improvement |

---

## 💡 **What Information You Get:**

### **In the Assignments List (Quick View):**
✅ Assignment title  
✅ Your course/class  
✅ Due date  
✅ Whether you submitted  
✅ Your marks (if graded)  
✅ Percentage score

### **In the Feedback Modal (Detailed View):**
✅ Full assignment title  
✅ Course name  
✅ When you submitted  
✅ Your marks + percentage (prominently displayed)  
✅ Teacher's detailed feedback  
✅ Your submitted file (to review)  

---

## 🔔 **Notifications for Grades**

When your teacher grades your assignment, you'll receive:
- ✅ **Toast Notification** (bottom right): "Assignment graded!"
- ✅ **Assignment Page Update**: Grade appears immediately
- Refresh page (F5) to see latest grades

---

## ❓ **FAQ**

### **Q: Why is my grade still "Pending"?**
**A**: Your teacher hasn't reviewed and graded your assignment yet. Check back later.

### **Q: Can I see other students' grades?**
**A**: No, you only see your own grades. This is private.

### **Q: What if I don't see the "View Feedback" button?**
**A**: 
- You haven't submitted yet, OR
- Your teacher hasn't graded yet
- Once graded, the button will appear

### **Q: How do I download my submitted file?**
**A**: Click "View Feedback" → Click "Download Submitted File" at the bottom

### **Q: Can I see my teacher's comments?**
**A**: Yes! In the "View Feedback" modal, the teacher's feedback appears in a highlighted box.

### **Q: Can I resubmit after getting a grade?**
**A**: Depends on your teacher's policy. The interface allows resubmission, but check with your teacher first.

---

## 🎨 **Visual Walkthrough**

### **Students Table with Grades:**
```
┌──────────────────┬──────────────┬──────────────┬────────────┬───────────┐
│ Title            │ Course       │ Due Date     │ Status     │ Grade     │
├──────────────────┼──────────────┼──────────────┼────────────┼───────────┤
│ Algebra Quiz     │ Math 101     │ Mar 15      │ ✓ Subm.    │ ┌───────┐ │
│                  │              │ 3 days left │            │ │85/100 │ │
│                  │              │             │            │ │(85%)  │ │
│                  │              │             │            │ └───────┘ │
├──────────────────┼──────────────┼──────────────┼────────────┼───────────┤
│ Lab Report       │ Science 201  │ Mar 20      │ ⏳ Pending │ Pending   │
│                  │              │ 8 days left │            │           │
├──────────────────┼──────────────┼──────────────┼────────────┼───────────┤
│ Essay            │ English 101  │ Mar 10      │ ✓ Subm.    │ ┌───────┐ │
│                  │              │ OVERDUE     │            │ │92/100 │ │
│                  │              │             │            │ │(92%)  │ │
│                  │              │             │            │ └───────┘ │
└──────────────────┴──────────────┴──────────────┴────────────┴───────────┘
```

---

## 🚀 **Best Practices**

1. **Check Regularly** - Teachers may grade at different times
2. **Review Feedback** - Read the teacher's comments to improve
3. **Keep Submitted Files** - Download them for your records
4. **Ask Questions** - If you don't understand feedback, ask teacher

---

## 📞 **Need Help?**

If you can't see your grades:
1. Refresh the page (F5)
2. Check if you submitted the assignment
3. Wait for teacher to grade
4. Contact your teacher

If the page shows errors, contact your system administrator.

---

**Last Updated**: March 3, 2026  
**System**: Video Call Assignment Management System
