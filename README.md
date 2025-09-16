# Enhanced Task Manager - Google Apps Script

A comprehensive task management system built with Google Apps Script, featuring user authentication, role-based access control, and a modern responsive interface.

## Features

### 🔐 Authentication & Security
- Secure user authentication with password hashing
- Session management with token-based authentication
- Role-based access control (Admin/User)
- Input validation and sanitization

### 📋 Task Management
- Create, read, update, and delete tasks
- Bulk operations (status updates, deletions)
- Task filtering by status, priority, and date range
- Real-time task statistics and dashboard
- Due date tracking with overdue indicators

### 👥 User Management
- User profile management
- Team member overview
- Avatar support
- User-specific task views

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/light theme support
- Interactive dashboard with statistics
- Real-time updates and auto-refresh
- Toast notifications for user feedback
- Loading states and progress indicators

### 📊 Analytics & Reporting
- Task statistics dashboard
- User-specific task metrics
- Overdue task tracking
- Date range filtering

## Prerequisites

- Google account
- Google Sheets access
- Basic knowledge of Google Apps Script

## Setup Instructions

### 1. Create a New Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Delete the default `Code.gs` content

### 2. Set Up Google Sheets Database

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
3. Update the `SHEET_ID` constant in `Code.gs` with your Sheet ID

### 3. Upload Project Files

Upload the following files to your Google Apps Script project:

1. **Code.gs** - Main backend logic
2. **index.html** - Main HTML template
3. **styles.html** - CSS styling
4. **script.html** - JavaScript functionality

### 4. Configure the Web App

1. In the Apps Script editor, click "Deploy" > "New deployment"
2. Choose "Web app" as the type
3. Set the following:
   - Execute as: "Me"
   - Who has access: "Anyone" (or "Anyone with Google account" for restricted access)
4. Click "Deploy"
5. Copy the web app URL

### 5. Initialize the Database

1. In the Apps Script editor, select the `initializeDatabase` function
2. Click "Run" to create the initial data structure
3. This will create the necessary sheets and sample data

### 6. Test the Application

1. Open the web app URL in your browser
2. Use the demo accounts to test the functionality:
   - **Admin**: admin@company.com / admin123
   - **User**: john@company.com / john123

## File Structure

```
├── Code.gs              # Backend logic and API endpoints
├── index.html           # Main HTML template
├── styles.html          # CSS styling and responsive design
├── script.html          # Frontend JavaScript functionality
└── README.md           # This documentation
```

## API Endpoints

### Authentication
- `login` - User authentication
- `logout` - User logout

### Tasks
- `getTasks` - Get all tasks (Admin only)
- `getUserTasks` - Get user-specific tasks
- `addTask` - Create new task (Admin only)
- `updateTask` - Update existing task
- `deleteTask` - Delete task (Admin only)
- `bulkUpdateTasks` - Bulk update tasks (Admin only)
- `bulkDeleteTasks` - Bulk delete tasks (Admin only)

### Users
- `getUsers` - Get all users (Admin only)

### Statistics
- `getTaskStats` - Get task statistics
- `getUserTaskStats` - Get user-specific statistics

## Database Schema

### Users Sheet
| Column | Type | Description |
|--------|------|-------------|
| ID | String | Unique user identifier |
| Name | String | User's full name |
| Email | String | User's email address |
| Password | String | Hashed password |
| Role | String | User role (admin/user) |
| Avatar | String | User avatar URL |

### Tasks Sheet
| Column | Type | Description |
|--------|------|-------------|
| ID | String | Unique task identifier |
| Title | String | Task title |
| Description | String | Task description |
| AssignedTo | String | User ID of assignee |
| AssignedBy | String | User ID of creator |
| Status | String | Task status (pending/in-progress/completed) |
| Priority | String | Task priority (low/medium/high) |
| DueDate | Date | Task due date |
| CreatedAt | Date | Creation timestamp |
| UpdatedAt | Date | Last update timestamp |

### Sessions Sheet
| Column | Type | Description |
|--------|------|-------------|
| UserID | String | User identifier |
| Token | String | Session token |
| CreatedAt | Date | Session creation time |
| ExpiresAt | Date | Session expiration time |

## Configuration

### Environment Variables
Update the following constants in `Code.gs`:

```javascript
const SHEET_ID = 'your-google-sheet-id-here';
```

### Security Settings
- Password hashing uses SHA-256 with salt
- Session tokens expire after 24 hours
- Input validation and sanitization on all user inputs
- CSRF protection through token validation

## Customization

### Adding New User Roles
1. Update the role validation in `Code.gs`
2. Add role-specific UI elements in `index.html`
3. Update access control logic in `script.html`

### Styling Customization
- Modify `styles.html` for custom themes
- Update color schemes in CSS variables
- Add custom animations and transitions

### Feature Extensions
- Add file attachments to tasks
- Implement task comments/notes
- Add email notifications
- Create task templates
- Add time tracking

## Troubleshooting

### Common Issues

1. **"Unable to access spreadsheet" error**
   - Verify the SHEET_ID is correct
   - Ensure the Google Sheet is accessible
   - Check Apps Script permissions

2. **Login not working**
   - Run `initializeDatabase` function to create sample users
   - Check browser console for JavaScript errors
   - Verify web app deployment settings

3. **Tasks not loading**
   - Check user permissions (Admin vs User roles)
   - Verify session token validity
   - Check Google Sheets API quotas

4. **Styling issues**
   - Clear browser cache
   - Check for CSS conflicts
   - Verify all HTML files are properly uploaded

### Debug Mode
- Press `Ctrl+Shift+D` to open debug panel (development only)
- Check browser console for detailed error messages
- Use Apps Script execution logs for backend debugging

## Security Considerations

- Passwords are hashed using SHA-256 with salt
- Session tokens are randomly generated and time-limited
- Input validation prevents XSS attacks
- CSRF protection through token validation
- Regular session cleanup for expired tokens

## Performance Optimization

- Efficient Google Sheets API usage
- Client-side caching for better performance
- Lazy loading of task data
- Optimized database queries
- Responsive design for mobile devices

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the Apps Script documentation
- Create an issue in the project repository

## Changelog

### Version 1.0.0
- Initial release
- User authentication and authorization
- Task management with CRUD operations
- Bulk operations support
- Responsive UI design
- Real-time dashboard
- Date filtering and search
- Role-based access control

---

**Note**: This is a Google Apps Script project. Make sure to follow Google's terms of service and Apps Script quotas when deploying and using this application.