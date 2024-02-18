export async function get_dbUser(username) {

    const query = `SELECT * FROM users WHERE username = $1`;
    try {
        const res = await pool.query(query, [username]);
        if (res.rows.length > 0) {
            return res.rows[0]; // ret first user found
        } else {
            return null; // No user found
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
        return null;
    }
}
export async function get_dbScenario(scenario_id) {

    const query = `SELECT * FROM scenarios WHERE id = $1`;
    try {
        const res = await pool.query(query, [scenario_id]);
        if (res.rows.length > 0) {
            return res.rows[0]; // ret first scenario found
        } else { return null; }
    } catch (err) {
        console.error('Error executing query', err.stack);
        return null;
    }
}