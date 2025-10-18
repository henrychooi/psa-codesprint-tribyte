# Career Compass - User Credentials Reference

## 🔐 All User Accounts & Passwords

### 📋 Quick Reference Table

| Username | Password | Role | Name | Employee ID | Department |
|----------|----------|------|------|-------------|------------|
| **samantha.lee** | password123 | Employee | Samantha Lee | EMP-20001 | Information Technology |
| **aisyah.rahman** | password123 | Employee | Nur Aisyah Binte Rahman | EMP-20002 | Information Technology |
| **rohan.mehta** | password123 | Employee | Rohan Mehta | EMP-20003 | Finance |
| **emily.wong** | password123 | Employee | Emily Wong | EMP-20004 | Business Analytics |
| **david.tan** | password123 | Employee | David Tan | EMP-20005 | Terminal Operations |
| **admin** | admin123 | Admin | System Administrator | - | IT Administration |
| **hr.admin** | admin123 | Admin | HR Administrator | - | Human Resources |

---

## 👤 Employee Accounts (Access: Copilot Only)

### 1. Samantha Lee
- **Username:** `samantha.lee`
- **Password:** `password123`
- **Employee ID:** EMP-20001
- **Job Title:** Cloud Solutions Architect
- **Department:** Information Technology
- **Email:** samantha.lee@globalpsa.com
- **Access:** Module 2 (Compass Copilot) only

### 2. Nur Aisyah Binte Rahman
- **Username:** `aisyah.rahman`
- **Password:** `password123`
- **Employee ID:** EMP-20002
- **Job Title:** Cybersecurity Analyst
- **Department:** Information Technology
- **Email:** aisyah.rahman@globalpsa.com
- **Access:** Module 2 (Compass Copilot) only

### 3. Rohan Mehta
- **Username:** `rohan.mehta`
- **Password:** `password123`
- **Employee ID:** EMP-20003
- **Job Title:** Finance Manager (FP&A)
- **Department:** Finance
- **Email:** rohan.mehta@globalpsa.com
- **Access:** Module 2 (Compass Copilot) only

### 4. Emily Wong
- **Username:** `emily.wong`
- **Password:** `password123`
- **Employee ID:** EMP-20004
- **Job Title:** Data Scientist
- **Department:** Business Analytics
- **Email:** emily.wong@globalpsa.com
- **Access:** Module 2 (Compass Copilot) only

### 5. David Tan
- **Username:** `david.tan`
- **Password:** `password123`
- **Employee ID:** EMP-20005
- **Job Title:** Operations Manager
- **Department:** Terminal Operations
- **Email:** david.tan@globalpsa.com
- **Access:** Module 2 (Compass Copilot) only

---

## 🛡️ Admin Accounts (Access: All Modules)

### 1. System Administrator
- **Username:** `admin`
- **Password:** `admin123`
- **Employee ID:** None (System Account)
- **Job Title:** System Administrator
- **Department:** IT Administration
- **Email:** admin@psa.com
- **Access:** All modules (Career Matching, Copilot, Leadership Potential)

### 2. HR Administrator
- **Username:** `hr.admin`
- **Password:** `admin123`
- **Employee ID:** None (System Account)
- **Job Title:** HR Administrator
- **Department:** Human Resources
- **Email:** hr.admin@psa.com
- **Access:** All modules (Career Matching, Copilot, Leadership Potential)

---

## 🔑 Password Summary

### Employee Passwords
- **All employees use:** `password123`
- Accounts: samantha.lee, aisyah.rahman, rohan.mehta, emily.wong, david.tan

### Admin Passwords
- **All admins use:** `admin123`
- Accounts: admin, hr.admin

---

## 📡 API Endpoints

### Get User List (Authenticated)
```http
GET /api/users
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 7,
  "users": [
    {
      "username": "samantha.lee",
      "role": "employee",
      "name": "Samantha Lee",
      "employee_id": "EMP-20001",
      "email": "samantha.lee@globalpsa.com",
      "job_title": "Cloud Solutions Architect",
      "department": "Information Technology"
    },
    ...
  ]
}
```

### Get User Credentials (Development Only - No Auth Required!)
```http
GET /api/users/credentials

Response:
{
  "success": true,
  "count": 7,
  "users": [
    {
      "username": "samantha.lee",
      "password": "password123",
      "role": "employee",
      "name": "Samantha Lee",
      "employee_id": "EMP-20001",
      ...
    },
    ...
  ],
  "warning": "This endpoint exposes passwords and should only be used in development"
}
```

### Get Demo Users (For Login Page)
```http
GET /api/auth/demo-users

Response:
{
  "success": true,
  "users": [
    {
      "username": "samantha.lee",
      "role": "employee",
      "name": "Samantha Lee",
      "job_title": "Cloud Solutions Architect",
      "password_hint": "password123"
    },
    ...
  ]
}
```

---

## 🧪 Testing Scenarios

### Test Employee Flow
```bash
# Login as Samantha Lee
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "samantha.lee",
    "password": "password123"
  }'

# Expected: Token + redirect to /copilot
# Can access: Compass Copilot only
# Cannot access: Career Matching, Leadership Potential
```

### Test Admin Flow
```bash
# Login as Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Expected: Token + redirect to / (home)
# Can access: All modules
```

### Get All Users List
```bash
# Get users (requires auth)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer samantha.lee"

# Get users with passwords (no auth, dev only)
curl http://localhost:5000/api/users/credentials
```

---

## 🎯 Employee-to-Profile Mapping

Each employee account is mapped to their profile in `Employee_Profiles.json`:

| Employee ID | Username | Name | Profile Data |
|-------------|----------|------|--------------|
| EMP-20001 | samantha.lee | Samantha Lee | Cloud Solutions Architect with 9+ years experience |
| EMP-20002 | aisyah.rahman | Nur Aisyah Binte Rahman | Cybersecurity Analyst with security expertise |
| EMP-20003 | rohan.mehta | Rohan Mehta | Finance Manager with FP&A background |
| EMP-20004 | emily.wong | Emily Wong | Data Scientist with analytics skills |
| EMP-20005 | david.tan | David Tan | Operations Manager with terminal operations experience |

---

## 📝 Usage Examples

### Frontend Login
```javascript
// Login with employee credentials
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'samantha.lee',
    password: 'password123'
  })
});

const data = await response.json();
// data.user contains: username, role, name, employee_id, email, job_title, department
// data.token is the auth token
```

### Get User List
```javascript
// Get all users (authenticated)
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
// data.users contains array of all user accounts
```

---

## ⚠️ Security Notes

1. **Development Only**: These are demo credentials for development/testing
2. **Plain Text Passwords**: Passwords are stored in plain text (would be hashed in production)
3. **No Password Complexity**: Simple passwords for easy testing
4. **Credentials Endpoint**: `/api/users/credentials` should be removed in production
5. **No Rate Limiting**: Multiple login attempts allowed (would be limited in production)

---

## 🚀 Quick Test Commands

**Test all employee logins:**
```bash
# Samantha Lee
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"samantha.lee","password":"password123"}'

# Aisyah Rahman
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"aisyah.rahman","password":"password123"}'

# Rohan Mehta
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"rohan.mehta","password":"password123"}'

# Emily Wong
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"emily.wong","password":"password123"}'

# David Tan
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"david.tan","password":"password123"}'
```

**Test admin logins:**
```bash
# Admin
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'

# HR Admin
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"hr.admin","password":"admin123"}'
```

---

## 📊 Summary

- **Total Users:** 7 (5 employees + 2 admins)
- **Employee Password:** `password123` (all 5 employees)
- **Admin Password:** `admin123` (both admins)
- **Employee IDs:** EMP-20001 through EMP-20005
- **Mapped to:** Employee_Profiles.json

**All employees have accounts and profiles!** ✅
