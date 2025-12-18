const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create connection pool for securevote database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'securevote_user',
  password: process.env.DB_PASSWORD || 'securevote_password123',
  database: process.env.DB_NAME || 'securevote',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true
});

// Create promise wrapper
const db = pool.promise();

// Test connection
const testConnection = async () => {
  try {
    const [rows] = await db.execute('SELECT 1');
    console.log('✅ MySQL Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide specific error messages
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your MySQL username and password in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist. Please create it manually in MySQL.');
      console.error('💡 Run: CREATE DATABASE securevote;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL server is not running. Start MySQL service first.');
    }
    
    return false;
  }
};

// Initialize database tables
const initDatabase = async () => {
  const createTables = [
    
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      dob DATE NOT NULL,
      gender ENUM('male', 'female', 'other') NOT NULL,
      face_data LONGTEXT,
      password_hash VARCHAR(255),
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      has_voted BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP NULL
    )`,

    `CREATE TABLE IF NOT EXISTS elections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status ENUM('active', 'upcoming', 'completed') DEFAULT 'upcoming',
      total_voters INT DEFAULT 0,
      votes_cast INT DEFAULT 0,
      type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS positions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      election_id INT,
      title VARCHAR(100) NOT NULL,
      description TEXT,
      max_selections INT DEFAULT 1,
      min_selections INT DEFAULT 1,
      FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      position_id INT,
      name VARCHAR(100) NOT NULL,
      party VARCHAR(100),
      agenda TEXT,
      symbol VARCHAR(10),
      votes INT DEFAULT 0,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(50),
      election_id INT,
      position_id INT,
      candidate_id INT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (election_id) References elections(id) ON DELETE CASCADE,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      UNIQUE KEY unique_vote (user_id, election_id, position_id)
    )`,

    `CREATE TABLE IF NOT EXISTS analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      total_voters INT DEFAULT 0,
      total_votes INT DEFAULT 0,
      voting_percentage DECIMAL(5,2) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // ===== ADMIN TABLE =====
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL
    )`
  ];

  try {
    for (const tableQuery of createTables) {
      await db.execute(tableQuery);
    }
    console.log('✅ Database tables initialized successfully');
    
    await insertSampleData();
    await createInitialSuperAdmin(); // Create initial super admin
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// ===== NEW FUNCTION: Create Initial Super Admin =====
const createInitialSuperAdmin = async () => {
  try {
    const [existingAdmins] = await db.execute('SELECT id FROM admins LIMIT 1');
    
    if (existingAdmins.length === 0) {
      console.log('👑 Creating initial super admin...');
      
      // Hash the default password
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      // Create super admin
      await db.execute(
        'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['superadmin', 'admin@securevote.com', passwordHash, 'super_admin']
      );
      
      // Create additional admin accounts for testing
      const adminUsers = [
        {
          username: 'admin',
          email: 'admin@securevote.com',
          password_hash: passwordHash,
          role: 'admin'
        },
        {
          username: 'moderator',
          email: 'moderator@securevote.com',
          password_hash: passwordHash,
          role: 'moderator'
        }
      ];

      for (const admin of adminUsers) {
        await db.execute(
          'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [admin.username, admin.email, admin.password_hash, admin.role]
        );
      }

      console.log('✅ Initial admin accounts created successfully');
      console.log('🔐 Default admin credentials:');
      console.log('   👑 Super Admin: superadmin / admin123');
      console.log('   👤 Admin: admin / admin123');
      console.log('   👥 Moderator: moderator / admin123');
      console.log('   📧 Email for all: [username]@securevote.com');
      
      const [adminCount] = await db.execute('SELECT COUNT(*) as count FROM admins');
      console.log(`👨‍💼 Total admin users created: ${adminCount[0].count}`);
    } else {
      console.log('✅ Admin accounts already exist');
    }
  } catch (error) {
    console.error('❌ Error creating initial super admin:', error);
  }
};

const insertSampleData = async () => {
  try {
    const [elections] = await db.execute('SELECT * FROM elections LIMIT 1');
    
    if (elections.length === 0) {
      console.log('📊 Inserting sample data...');
      
      // Insert sample election
      const [electionResult] = await db.execute(
        'INSERT INTO elections (title, description, start_date, end_date, status, type, total_voters, votes_cast) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['Student Council Election 2024', 'Vote for your student council representatives', '2024-03-01', '2024-03-15', 'active', 'student', 1000, 0]
      );

      const electionId = electionResult.insertId;

      // Insert positions
      const positions = [
        { title: 'President', description: 'Chief executive officer', maxSelections: 1, minSelections: 1 },
        { title: 'Vice President', description: 'Supports the president', maxSelections: 1, minSelections: 1 },
        { title: 'Secretary', description: 'Manages records', maxSelections: 1, minSelections: 1 }
      ];

      for (const position of positions) {
        const [positionResult] = await db.execute(
          'INSERT INTO positions (election_id, title, description, max_selections, min_selections) VALUES (?, ?, ?, ?, ?)',
          [electionId, position.title, position.description, position.maxSelections, position.minSelections]
        );

        const positionId = positionResult.insertId;

        // Insert candidates for each position
        const candidates = [
          { name: 'John Smith', party: 'Unity Party', agenda: 'Student welfare and campus improvements', symbol: '👥' },
          { name: 'Sarah Johnson', party: 'Progress Alliance', agenda: 'Innovation and digital transformation', symbol: '🚀' },
          { name: 'Mike Chen', party: 'Green Future', agenda: 'Sustainability and environment', symbol: '🌱' }
        ];

        for (const candidate of candidates) {
          await db.execute(
            'INSERT INTO candidates (position_id, name, party, agenda, symbol, votes) VALUES (?, ?, ?, ?, ?, ?)',
            [positionId, candidate.name, candidate.party, candidate.agenda, candidate.symbol, 0]
          );
        }
      }

      // Initialize analytics
      await db.execute(
        'INSERT INTO analytics (total_voters, total_votes, voting_percentage) VALUES (0, 0, 0)'
      );

      console.log('✅ Sample data inserted successfully');
      
      // Show what was inserted
      const [electionCount] = await db.execute('SELECT COUNT(*) as count FROM elections');
      const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
      const [candidateCount] = await db.execute('SELECT COUNT(*) as count FROM candidates');
      
      console.log(`📊 Database contains: ${electionCount[0].count} elections, ${userCount[0].count} users, ${candidateCount[0].count} candidates`);
    } else {
      console.log('✅ Sample data already exists');
    }
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// Initialize database on startup
const initializeDatabase = async () => {
  const connected = await testConnection();
  if (connected) {
    await initDatabase();
    console.log('✅ Backend setup completed successfully!');
    console.log('🎯 You can now:');
    console.log('   1. Start your server: npm start');
    console.log('   2. Access admin panel: http://localhost:3000/admin/login.html');
    console.log('   3. Login with: superadmin / admin123');
  } else {
    console.error('❌ Failed to initialize database');
  }
};

// Run initialization
initializeDatabase();

// Export the database connection
module.exports = db;

// Export initialization function for manual execution
module.exports.initializeDatabase = initializeDatabase;
module.exports.createInitialSuperAdmin = createInitialSuperAdmin;