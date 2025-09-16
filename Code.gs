// Configuration - Replace with your Google Sheet ID
const SHEET_ID = '1WG3t0_nvoyQM3gDtwB9KPXB__zeZLBWuXUnqzXF7wVU';

// Utility functions
function hashPassword(password) {
  // Simple hash function - in production, use a proper hashing library
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + 'SALT_2025'));
}

function generateSessionToken() {
  return Utilities.base64Encode(Utilities.getUuid());
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 1000); // Limit length and trim
}

// Get the spreadsheet
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SHEET_ID);
  } catch (error) {
    console.error('Error opening spreadsheet:', error);
    throw new Error('Unable to access spreadsheet. Please check the SHEET_ID.');
  }
}

// Initialize database with sample data including passwords
function initializeDatabase() {
  try {
    const ss = getSpreadsheet();
    
    // Initialize Users sheet with password column
    let usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) {
      usersSheet = ss.insertSheet('Users');
    }
    usersSheet.clear();
    usersSheet.getRange(1, 1, 1, 6).setValues([['ID', 'Name', 'Email', 'Password', 'Role', 'Avatar']]);
    
    const userData = [
      ['1', 'Admin User', 'admin@company.com', hashPassword('admin123'), 'admin', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'],
      ['2', 'John Smith', 'john@company.com', hashPassword('john123'), 'user', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'],
      ['3', 'Sarah Johnson', 'sarah@company.com', hashPassword('sarah123'), 'user', 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'],
      ['4', 'Mike Davis', 'mike@company.com', hashPassword('mike123'), 'user', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150']
    ];
    
    if (userData.length > 0) {
      usersSheet.getRange(2, 1, userData.length, 6).setValues(userData);
    }
    
    // Initialize Sessions sheet for token management
    let sessionsSheet = ss.getSheetByName('Sessions');
    if (!sessionsSheet) {
      sessionsSheet = ss.insertSheet('Sessions');
    }
    sessionsSheet.clear();
    sessionsSheet.getRange(1, 1, 1, 4).setValues([['UserID', 'Token', 'CreatedAt', 'ExpiresAt']]);
    
    // Initialize Tasks sheet
    let tasksSheet = ss.getSheetByName('Tasks');
    if (!tasksSheet) {
      tasksSheet = ss.insertSheet('Tasks');
    }
    tasksSheet.clear();
    tasksSheet.getRange(1, 1, 1, 10).setValues([['ID', 'Title', 'Description', 'AssignedTo', 'AssignedBy', 'Status', 'Priority', 'DueDate', 'CreatedAt', 'UpdatedAt']]);
    
    const now = new Date();
    const taskData = [
      ['1', 'Complete Project Documentation', 'Write comprehensive documentation for the new project including API specs and user guides.', '2', '1', 'in-progress', 'high', '2025-01-25', now, now],
      ['2', 'Design Review Meeting', 'Attend the weekly design review meeting and provide feedback on new mockups.', '3', '1', 'pending', 'medium', '2025-01-20', now, now],
      ['3', 'Database Migration', 'Migrate the production database to the new schema version and run tests.', '4', '1', 'completed', 'high', '2025-01-18', now, now],
      ['4', 'Client Presentation', 'Prepare and deliver presentation to client about project progress and next steps.', '2', '1', 'pending', 'high', '2025-01-22', now, now],
      ['5', 'Code Review', 'Review pull requests and provide detailed feedback on code quality and structure.', '3', '1', 'in-progress', 'medium', '2025-01-21', now, now],
      ['6', 'Update User Interface', 'Modernize the user interface with new design components.', '2', '1', 'pending', 'medium', '2025-01-28', now, now],
      ['7', 'Security Audit', 'Conduct comprehensive security audit of the application.', '4', '1', 'in-progress', 'high', '2025-01-30', now, now]
    ];
    
    if (taskData.length > 0) {
      tasksSheet.getRange(2, 1, taskData.length, 10).setValues(taskData);
    }
    
    return 'Database initialized successfully!';
  } catch (error) {
    console.error('Error initializing database:', error);
    return 'Error initializing database: ' + error.toString();
  }
}

// Session management functions
function createSession(userId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Sessions');
    
    if (!sheet) {
      throw new Error('Sessions sheet not found');
    }
    
    const token = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    
    sheet.appendRow([userId, token, now, expiresAt]);
    
    return token;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

function validateSession(token) {
  try {
    if (!token) return false;
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Sessions');
    
    if (!sheet) {
      return false;
    }
    
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === token) {
        const expiresAt = new Date(data[i][3]);
        if (expiresAt > now) {
          return data[i][0]; // Return userId
        } else {
          // Session expired, remove it
          sheet.deleteRow(i + 1);
          return false;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

function invalidateSession(token) {
  try {
    if (!token) return;
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Sessions');
    
    if (!sheet) {
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === token) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  } catch (error) {
    console.error('Error invalidating session:', error);
  }
}

// Authentication functions
function authenticateUser(email, password) {
  try {
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }
    
    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address'
      };
    }
    
    if (password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long'
      };
    }
    
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Check password hash
    const passwordHash = hashPassword(password);
    if (user.password !== passwordHash) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Create session
    const token = createSession(user.id);
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
      token: token
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed. Please try again.'
    };
  }
}

function logoutUser(token) {
  try {
    invalidateSession(token);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed' };
  }
}

// User management functions
function getUsers() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    
    if (!sheet) {
      console.error('Users sheet not found');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('No user data found');
      return [];
    }
    
    const headers = data[0];
    
    return data.slice(1).map(row => {
      const user = {};
      headers.forEach((header, index) => {
        user[header.toLowerCase()] = row[index];
      });
      return user;
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

function getUserById(userId) {
  try {
    const users = getUsers();
    return users.find(user => user.id && user.id.toString() === userId.toString());
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Task management functions with validation
function getTasks(startDate, endDate) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      console.error('Tasks sheet not found');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('No task data found');
      return [];
    }
    
    let tasks = data.slice(1).map((row, index) => {
      try {
        return {
          id: row[0] ? row[0].toString() : (index + 1).toString(),
          title: sanitizeInput(row[1] || ''),
          description: sanitizeInput(row[2] || ''),
          assignedto: row[3] ? row[3].toString() : '',
          assignedby: row[4] ? row[4].toString() : '',
          status: row[5] || 'pending',
          priority: row[6] || 'medium',
          duedate: row[7] instanceof Date ? row[7].toISOString().split('T')[0] : (row[7] || ''),
          createdat: row[8] instanceof Date ? row[8].toISOString() : (row[8] || ''),
          updatedat: row[9] instanceof Date ? row[9].toISOString() : (row[9] || '')
        };
      } catch (taskError) {
        console.error('Error processing task row:', taskError, row);
        return null;
      }
    }).filter(task => task !== null);
    
    // Apply date filtering if provided
    if (startDate && endDate) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      tasks = tasks.filter(task => {
        try {
          const taskDate = new Date(task.duedate);
          return !isNaN(taskDate.getTime()) && taskDate >= start && taskDate <= end;
        } catch (dateError) {
          console.error('Error filtering task by date:', dateError, task);
          return false;
        }
      });
    }
    
    console.log('Successfully loaded tasks:', tasks.length);
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

function getTasksByUser(userId, startDate, endDate) {
  try {
    const tasks = getTasks(startDate, endDate);
    return tasks.filter(task => task.assignedto && task.assignedto.toString() === userId.toString());
  } catch (error) {
    console.error('Error getting tasks by user:', error);
    return [];
  }
}

function validateTaskData(taskData) {
  const errors = [];
  
  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.push('Task title is required');
  } else if (taskData.title.length > 200) {
    errors.push('Task title must be less than 200 characters');
  }
  
  if (!taskData.description || taskData.description.trim().length === 0) {
    errors.push('Task description is required');
  } else if (taskData.description.length > 2000) {
    errors.push('Task description must be less than 2000 characters');
  }
  
  if (!taskData.assignedTo) {
    errors.push('Task must be assigned to someone');
  }
  
  if (!taskData.dueDate || !isValidDate(taskData.dueDate)) {
    errors.push('Valid due date is required (YYYY-MM-DD)');
  } else {
    const dueDate = new Date(taskData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      errors.push('Due date cannot be in the past');
    }
  }
  
  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (taskData.status && !validStatuses.includes(taskData.status)) {
    errors.push('Invalid status. Must be pending, in-progress, or completed');
  }
  
  const validPriorities = ['low', 'medium', 'high'];
  if (taskData.priority && !validPriorities.includes(taskData.priority)) {
    errors.push('Invalid priority. Must be low, medium, or high');
  }
  
  return errors;
}

function addTask(taskData) {
  try {
    // Validate task data
    const validationErrors = validateTaskData(taskData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: validationErrors.join('; ')
      };
    }
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      throw new Error('Tasks sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Generate new ID
    const ids = data.slice(1).map(row => {
      const id = parseInt(row[0], 10);
      return isNaN(id) ? 0 : id;
    });
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    
    const now = new Date();
    const newTask = [
      newId.toString(),
      sanitizeInput(taskData.title || ''),
      sanitizeInput(taskData.description || ''),
      taskData.assignedTo || '',
      taskData.assignedBy || '',
      taskData.status || 'pending',
      taskData.priority || 'medium',
      taskData.dueDate || '',
      now,
      now
    ];
    
    sheet.appendRow(newTask);
    return { success: true, id: newId.toString() };
  } catch (error) {
    console.error('Error adding task:', error);
    return { success: false, message: 'Failed to create task: ' + error.message };
  }
}

function updateTask(taskId, updates) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      throw new Error('Tasks sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString() === taskId.toString()) {
        // Update specific fields with validation
        if (updates.title !== undefined) {
          if (updates.title.length > 200) {
            return { success: false, message: 'Title too long' };
          }
          data[i][1] = sanitizeInput(updates.title);
        }
        if (updates.description !== undefined) {
          if (updates.description.length > 2000) {
            return { success: false, message: 'Description too long' };
          }
          data[i][2] = sanitizeInput(updates.description);
        }
        if (updates.assignedTo !== undefined) data[i][3] = updates.assignedTo;
        if (updates.status !== undefined) {
          const validStatuses = ['pending', 'in-progress', 'completed'];
          if (!validStatuses.includes(updates.status)) {
            return { success: false, message: 'Invalid status' };
          }
          data[i][5] = updates.status;
        }
        if (updates.priority !== undefined) {
          const validPriorities = ['low', 'medium', 'high'];
          if (!validPriorities.includes(updates.priority)) {
            return { success: false, message: 'Invalid priority' };
          }
          data[i][6] = updates.priority;
        }
        if (updates.dueDate !== undefined) {
          if (!isValidDate(updates.dueDate)) {
            return { success: false, message: 'Invalid due date format' };
          }
          data[i][7] = updates.dueDate;
        }
        data[i][9] = new Date(); // Updated timestamp
        
        sheet.getRange(i + 1, 1, 1, 10).setValues([data[i]]);
        return { success: true };
      }
    }
    
    return { success: false, message: 'Task not found' };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, message: 'Update failed: ' + error.message };
  }
}

function bulkUpdateTasks(taskIds, updates) {
  try {
    let successCount = 0;
    let errors = [];
    
    for (const taskId of taskIds) {
      const result = updateTask(taskId, updates);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`Task ${taskId}: ${result.message}`);
      }
    }
    
    return {
      success: errors.length === 0,
      message: `Updated ${successCount} of ${taskIds.length} tasks`,
      errors: errors
    };
  } catch (error) {
    console.error('Error in bulk update:', error);
    return { success: false, message: 'Bulk update failed: ' + error.message };
  }
}

function deleteTask(taskId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      throw new Error('Tasks sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString() === taskId.toString()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
    return { success: false, message: 'Task not found' };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, message: 'Delete failed: ' + error.message };
  }
}

function bulkDeleteTasks(taskIds) {
  try {
    let successCount = 0;
    let errors = [];
    
    // Sort task IDs in descending order to delete from bottom to top
    const sortedIds = [...taskIds].sort((a, b) => parseInt(b) - parseInt(a));
    
    for (const taskId of sortedIds) {
      const result = deleteTask(taskId);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`Task ${taskId}: ${result.message}`);
      }
    }
    
    return {
      success: errors.length === 0,
      message: `Deleted ${successCount} of ${taskIds.length} tasks`,
      errors: errors
    };
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return { success: false, message: 'Bulk delete failed: ' + error.message };
  }
}

function getTaskStats(startDate, endDate) {
  try {
    const tasks = getTasks(startDate, endDate);
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      overdue: tasks.filter(task => {
        try {
          const dueDate = new Date(task.duedate);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return !isNaN(dueDate.getTime()) && dueDate < today && task.status !== 'completed';
        } catch (error) {
          return false;
        }
      }).length
    };
  } catch (error) {
    console.error('Error getting task stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  }
}

function getUserTaskStats(userId, startDate, endDate) {
  try {
    const tasks = getTasksByUser(userId, startDate, endDate);
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      overdue: tasks.filter(task => {
        try {
          const dueDate = new Date(task.duedate);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return !isNaN(dueDate.getTime()) && dueDate < today && task.status !== 'completed';
        } catch (error) {
          return false;
        }
      }).length
    };
  } catch (error) {
    console.error('Error getting user task stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  }
}

// Web app functions
function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput('Error loading application: ' + error.toString());
  }
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('Error including file:', filename, error);
    return '/* Error loading ' + filename + ': ' + error.toString() + ' */';
  }
}

// Enhanced API endpoints with better error handling
function handleRequest(action, data, token) {
  try {
    console.log('Handling request:', action, 'Data:', data, 'Token present:', !!token);
    
    // Ensure data is an object
    if (!data) data = {};
    
    // Public endpoints (no token required)
    if (action === 'login') {
      return authenticateUser(data.email, data.password);
    }
    
    // Protected endpoints (token required)
    if (!token) {
      console.log('No token provided for protected endpoint');
      return { success: false, message: 'Authentication required' };
    }
    
    const userId = validateSession(token);
    if (!userId) {
      console.log('Invalid or expired session');
      return { success: false, message: 'Invalid or expired session' };
    }
    
    const user = getUserById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return { success: false, message: 'User not found' };
    }
    
    const isAdmin = user.role === 'admin';
    console.log('User:', user.name, 'Is Admin:', isAdmin, 'Action:', action);
    
    switch (action) {
      case 'logout':
        return logoutUser(token);
      
      case 'getTasks':
        if (!isAdmin) {
          return { success: false, message: 'Admin access required' };
        }
        const allTasks = getTasks(data.startDate, data.endDate);
        console.log('Returning all tasks:', allTasks.length);
        return { success: true, data: allTasks };
      
      case 'getUserTasks':
        const targetUserId = data.userId || userId;
        const userTasks = getTasksByUser(targetUserId, data.startDate, data.endDate);
        console.log('Returning user tasks for user', targetUserId, ':', userTasks.length);
        return { success: true, data: userTasks };
      
      case 'getUsers':
        if (!isAdmin) {
          return { success: false, message: 'Admin access required' };
        }
        const users = getUsers().map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        });
        console.log('Returning users:', users.length);
        return { success: true, data: users };
      
      case 'addTask':
        if (!isAdmin) {
          return { success: false, message: 'Admin access required' };
        }
        return addTask(data);
      
      case 'updateTask':
        if (!isAdmin && data.id && getTaskById(data.id)?.assignedto !== userId.toString()) {
          return { success: false, message: 'Can only update your own tasks' };
        }
        return updateTask(data.id, data.updates || {});
      
      case 'bulkUpdateTasks':
        if (!isAdmin) {
          return { success: false, message: 'Admin access required' };
        }
        return bulkUpdateTasks(data.taskIds || [], data.updates || {});
      
      case 'deleteTask':
        if (!isAdmin) {
          return { success: false, message: 'Admin access required' };
        }
        return deleteTask(data.id);
      
      case 'bulkDeleteTasks':
        if (!isAdmin) {
          return { success: false, message: 'Admin access required' };
        }
        return bulkDeleteTasks(data.taskIds || []);
      
      case 'getTaskStats':
        const statsUserId = isAdmin ? null : userId;
        if (statsUserId) {
          const stats = getUserTaskStats(statsUserId, data.startDate, data.endDate);
          console.log('Returning user stats:', stats);
          return { success: true, data: stats };
        } else {
          const stats = getTaskStats(data.startDate, data.endDate);
          console.log('Returning all stats:', stats);
          return { success: true, data: stats };
        }
      
      default:
        console.log('Invalid action:', action);
        return { success: false, message: 'Invalid action: ' + action };
    }
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return { success: false, message: 'Server error: ' + error.toString() };
  }
}

function getTaskById(taskId) {
  try {
    const tasks = getTasks();
    return tasks.find(task => task.id && task.id.toString() === taskId.toString());
  } catch (error) {
    console.error('Error getting task by ID:', error);
    return null;
  }
}

// Test function to verify database setup
function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test spreadsheet access
    const ss = getSpreadsheet();
    console.log('Spreadsheet accessed successfully');
    
    // Test users
    const users = getUsers();
    console.log('Users loaded:', users.length);
    
    // Test tasks
    const tasks = getTasks();
    console.log('Tasks loaded:', tasks.length);
    
    // Test authentication
    const authResult = authenticateUser('admin@company.com', 'admin123');
    console.log('Authentication test:', authResult.success ? 'SUCCESS' : 'FAILED');
    
    return {
      success: true,
      data: {
        users: users.length,
        tasks: tasks.length,
        authTest: authResult.success
      }
    };
  } catch (error) {
    console.error('Database test failed:', error);
    return {
      success: false,
      message: error.toString()
    };
  }
}