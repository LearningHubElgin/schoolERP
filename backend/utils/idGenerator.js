// Helper function to generate Student Unique ID
const generateStudentUniqueId = async (schoolId, connection) => {
    // 1. Get School Name
    const [schools] = await connection.query('SELECT name FROM schools WHERE id = ?', [schoolId]);
    if (schools.length === 0) throw new Error('School not found for ID generation');
    
    // 2. Create Prefix: First 5 alpha chars, uppercase
    const schoolName = schools[0].name;
    const prefix = schoolName.replace(/[^A-Za-z]/g, '').substring(0, 5).toUpperCase();
    
    // 3. Get Year
    const year = new Date().getFullYear();
    const prefixWithYear = `${prefix}${year}`;
    
    // 4. Find max serial for this prefix
    const [existing] = await connection.query(
        'SELECT student_unique_id FROM students WHERE student_unique_id LIKE ? ORDER BY student_unique_id DESC LIMIT 1',
        [`${prefixWithYear}%`]
    );
    
    let serial = 1;
    if (existing.length > 0 && existing[0].student_unique_id) {
        const lastSerial = parseInt(existing[0].student_unique_id.substring(prefixWithYear.length), 10);
        if (!isNaN(lastSerial)) {
            serial = lastSerial + 1;
        }
    }
    
    return `${prefixWithYear}${String(serial).padStart(3, '0')}`;
};

module.exports = { generateStudentUniqueId };
