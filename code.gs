// Configuration - Replace with your Google Sheet ID
const SHEET_ID = '1WG3t0_nvoyQM3gDtwB9KPXB__zeZLBWuXUnqzXF7wVU';

// Get the spreadsheet
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SHEET_ID);
  } catch (error) {
    console.error('Error opening spreadsheet:', error);
    throw new Error('Unable to access spreadsheet. Please check the SHEET_ID.');
  }
}

// Initialize database with sample data
function initializeDatabase() {
  try {
    const ss = getSpreadsheet();
    
    // Initialize Users sheet
    let usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) {
      usersSheet = ss.insertSheet('Users');
    }
    usersSheet.clear();
    usersSheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Email', 'Role', 'Avatar']]);
    
    const userData = [
      ['1', 'Admin User', 'admin@company.com', 'admin', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'],
      ['2', 'John Smith', 'john@company.com', 'user', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'],
      ['3', 'Sarah Johnson', 'sarah@company.com', 'user', 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'],
      ['4', 'Mike Davis', 'mike@company.com', 'user', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150']
    ];
    
    if (userData.length > 0) {
      usersSheet.getRange(2, 1, userData.length, 5).setValues(userData);
    }
    
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

// Authentication functions
function authenticateUser(email, password) {
  try {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    // Simple password check (in production, use proper hashing)
    if (user && password === 'password123') {
      return {
        success: true,
        user: user
      };
    }
    
    return {
      success: false,
      message: 'Invalid credentials'
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed: ' + error.toString()
    };
  }
}

// User management functions
function getUsers() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
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
    throw error;
  }
}

function getUserById(userId) {
  try {
    const users = getUsers();
    return users.find(user => user.id.toString() === userId.toString());
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Task management functions
function getTasks() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      throw new Error('Tasks sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0];
    
    return data.slice(1).map(row => {
      return {
        id: row[0].toString(),
        title: row[1] || '',
        description: row[2] || '',
        assignedto: row[3].toString(),
        assignedby: row[4].toString(),
        status: row[5] || 'pending',
        priority: row[6] || 'medium',
        duedate: row[7] instanceof Date ? row[7].toISOString().split('T')[0] : row[7],
        createdat: row[8] instanceof Date ? row[8].toISOString() : row[8],
        updatedat: row[9] instanceof Date ? row[9].toISOString() : row[9]
      };
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

function getTasksByUser(userId) {
  try {
    const tasks = getTasks();
    return tasks.filter(task => task.assignedto.toString() === userId.toString());
  } catch (error) {
    console.error('Error getting tasks by user:', error);
    throw error;
  }
}

function addTask(taskData) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Tasks');
    
    if (!sheet) {
      throw new Error('Tasks sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Extract existing IDs and find the max
    const ids = data.slice(1).map(row => {
      const id = parseInt(row[0], 10);
      return isNaN(id) ? 0 : id;
    });
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    
    const now = new Date();
    const newTask = [
      newId.toString(),
      taskData.title || '',
      taskData.description || '',
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
    return { success: false, message: error.toString() };
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
      if (data[i][0].toString() === taskId.toString()) {
        // Update specific fields
        if (updates.title !== undefined) data[i][1] = updates.title;
        if (updates.description !== undefined) data[i][2] = updates.description;
        if (updates.assignedTo !== undefined) data[i][3] = updates.assignedTo;
        if (updates.status !== undefined) data[i][5] = updates.status;
        if (updates.priority !== undefined) data[i][6] = updates.priority;
        if (updates.dueDate !== undefined) data[i][7] = updates.dueDate;
        data[i][9] = new Date(); // Updated timestamp
        
        sheet.getRange(i + 1, 1, 1, 10).setValues([data[i]]);
        return { success: true };
      }
    }
    
    return { success: false, message: 'Task not found' };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, message: error.toString() };
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
      if (data[i][0].toString() === taskId.toString()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
    return { success: false, message: 'Task not found' };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, message: error.toString() };
  }
}

function getTaskStats() {
  try {
    const tasks = getTasks();
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };
  } catch (error) {
    console.error('Error getting task stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0 };
  }
}

function getUserTaskStats(userId) {
  try {
    const tasks = getTasksByUser(userId);
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };
  } catch (error) {
    console.error('Error getting user task stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0 };
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

// API endpoints for the web app
function handleRequest(action, data) {
  try {
    console.log('Handling request:', action, data);
    
    switch (action) {
      case 'login':
        return authenticateUser(data.email, data.password);
      
      case 'getTasks':
        return { success: true, data: getTasks() };
      
      case 'getUserTasks':
        return { success: true, data: getTasksByUser(data.userId) };
      
      case 'getUsers':
        return { success: true, data: getUsers() };
      
      case 'addTask':
        return addTask(data);
      
      case 'updateTask':
        return updateTask(data.id, data.updates);
      
      case 'deleteTask':
        return deleteTask(data.id);
      
      case 'getTaskStats':
        return { success: true, data: getTaskStats() };
      
      case 'getUserTaskStats':
        return { success: true, data: getUserTaskStats(data.userId) };
      
      default:
        return { success: false, message: 'Invalid action: ' + action };
    }
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return { success: false, message: 'Server error: ' + error.toString() };
  }
}

